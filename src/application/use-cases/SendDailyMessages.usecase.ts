import type { DailyExecutionResultDto } from '#application/dto/DailyExecutionResult.dto.js';
import type { IConversationReader } from '#application/ports/IConversationReader.js';
import type { IMessageProvider } from '#application/ports/IMessageProvider.js';
import type { IMessageGenerator } from '#application/ports/IMessageGenerator.js';
import type { IMessageSender } from '#application/ports/IMessageSender.js';
import type { SendMessageResultDto } from '#application/dto/SendMessageResult.dto.js';
import type { IMessageRepository } from '#application/ports/IMessageRepository.js';
import type { IConversationRepository } from '#application/ports/IConversationRepository.js';
import type { Conversation } from '#domain/entities/Conversation.js';
import { EligibilityService } from '#application/services/EligibilityService.js';
import { MessageSelectionService } from '#application/services/MessageSelectionService.js';
import { IntroductionMessageService } from '#application/services/IntroductionMessageService.js';
import { Message } from '#domain/entities/Message.js';
import { MessageId } from '#domain/value-objects/MessageId.js';
import { MessageType } from '#domain/enums/MessageType.js';
import { SendStatus } from '#domain/enums/SendStatus.js';
import type { ILogger } from '#application/ports/ILogger.js';

/**
 * Primary application use case orchestrating the daily streak message automation workflow with idempotency and retry resilience.
 */
export class SendDailyMessagesUseCase {
  private readonly maxRetries = 3;

  public constructor(
    private readonly conversationReader: IConversationReader,
    private readonly eligibilityService: EligibilityService,
    private readonly messageSelectionService: MessageSelectionService,
    private readonly introductionMessageService: IntroductionMessageService,
    private readonly messageProvider: IMessageProvider,
    private readonly messageGenerator: IMessageGenerator,
    private readonly messageSender: IMessageSender,
    private readonly messageRepository: IMessageRepository,
    private readonly conversationRepository?: IConversationRepository,
    private readonly logger?: ILogger,
  ) {}

  public async execute(): Promise<DailyExecutionResultDto> {
    const startTime = Date.now();
    const executedAt = new Date();
    this.logger?.info('[JOB_STARTED] Starting daily streak messages automation workflow.');

    const isSessionActive = await this.eligibilityService.isSessionValid();
    if (!isSessionActive) {
      this.logger?.error('[JOB_FAILED] Automation session is invalid or expired. Aborting daily execution.');
      return {
        processedConversations: 0,
        sentMessages: 0,
        failedMessages: 0,
        skippedConversations: 0,
        executedAt,
        durationMs: Date.now() - startTime,
      };
    }

    const streakConversations = await this.conversationReader.readStreakConversations();
    let processedConversations = 0;
    let sentMessages = 0;
    let failedMessages = 0;
    let skippedConversations = 0;

    for (const conversation of streakConversations) {
      processedConversations++;
      const contactId = conversation.contact.id.getValue();

      if (!this.eligibilityService.isEligible(conversation, executedAt)) {
        skippedConversations++;
        this.logger?.info(`[MESSAGE_SKIPPED] Contact: ${contactId}, Reason: Not eligible for streak message.`);
        continue;
      }

      // Idempotency Check: Verify if contact has already received a message today
      const alreadyReceivedToday = await this.messageRepository.hasReceivedMessageToday(
        conversation.id,
        executedAt,
      );
      if (alreadyReceivedToday) {
        skippedConversations++;
        this.logger?.info(`[MESSAGE_SKIPPED] Contact: ${contactId}, Reason: Already received message today.`);
        continue;
      }

      try {
        const hasIntro = await this.messageRepository.hasReceivedIntroductionMessage(conversation.id);
        let messageToSend: Message;

        if (!hasIntro) {
          this.logger?.info(
            `Conversation ${conversation.id.getValue()} has not received introduction. Building intro message.`,
          );
          const introContent = this.introductionMessageService.buildIntroductionContent(conversation);
          messageToSend = Message.create({
            id: MessageId.generate(),
            conversationId: conversation.id,
            type: MessageType.CURIOSITY,
            content: introContent,
            status: SendStatus.PENDING,
          });
        } else {
          const selectedType = this.messageSelectionService.selectMessageType();
          this.logger?.info(
            `Selected message type ${selectedType} for conversation ${conversation.id.getValue()}.`,
          );
          messageToSend = await this.messageGenerator.generateForConversation(conversation, selectedType);
        }

        // Retry Strategy (max 3 retries for temporary failures)
        const sendResult = await this.sendMessageWithRetry(conversation, messageToSend);

        if (sendResult.success) {
          messageToSend.markAsSent(sendResult.sentAt ?? new Date());
          conversation.recordMessageSent(messageToSend.sentAt);
          sentMessages++;
          this.logger?.info(`[MESSAGE_SENT] Contact: ${contactId}, Conversation: ${conversation.id.getValue()}`);
        } else {
          messageToSend.markAsFailed(sendResult.errorMessage ?? 'Failed to deliver message after retries.');
          failedMessages++;
          this.logger?.warn(
            `[MESSAGE_FAILED] Contact: ${contactId}, Reason: ${sendResult.errorMessage}`,
          );
        }

        await this.messageRepository.save(messageToSend);
        if (this.conversationRepository) {
          await this.conversationRepository.update(conversation);
        }
      } catch (err) {
        failedMessages++;
        this.logger?.error(`[MESSAGE_FAILED] Unexpected error processing contact: ${contactId}`, err);
      }
    }

    const durationMs = Date.now() - startTime;
    this.logger?.info(
      `[JOB_COMPLETED] Processed: ${processedConversations}, Sent: ${sentMessages}, Failed: ${failedMessages}, Skipped: ${skippedConversations}.`,
    );

    return {
      processedConversations,
      sentMessages,
      failedMessages,
      skippedConversations,
      executedAt,
      durationMs,
    };
  }

  private async sendMessageWithRetry(
    conversation: Conversation,
    message: Message,
  ): Promise<SendMessageResultDto> {
    let lastResult: SendMessageResultDto = {
      conversationId: conversation.id.getValue(),
      messageId: message.id.getValue(),
      success: false,
      errorMessage: 'Initial state',
    };

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        lastResult = await this.messageSender.sendMessage(conversation, message);
        if (lastResult.success) {
          return lastResult;
        }

        // Check if error is permanent (e.g. invalid session, deleted user, blocked)
        const isPermanentError =
          lastResult.errorMessage?.includes('invalid session') ||
          lastResult.errorMessage?.includes('user deleted') ||
          lastResult.errorMessage?.includes('blocked');

        if (isPermanentError) {
          this.logger?.warn(`Permanent error encountered on attempt ${attempt}. Stopping retries.`);
          return lastResult;
        }

        this.logger?.warn(`Temporary send error on attempt ${attempt}/${this.maxRetries}. Retrying...`);
      } catch (err) {
        lastResult = {
          conversationId: conversation.id.getValue(),
          messageId: message.id.getValue(),
          success: false,
          errorMessage: err instanceof Error ? err.message : String(err),
        };
        this.logger?.warn(`Exception on attempt ${attempt}/${this.maxRetries}: ${lastResult.errorMessage}`);
      }
    }

    return lastResult;
  }
}
