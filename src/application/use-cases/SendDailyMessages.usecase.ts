import type { DailyExecutionResultDto } from '#application/dto/DailyExecutionResult.dto.js';
import type { IConversationReader } from '#application/ports/IConversationReader.js';
import type { IMessageProvider } from '#application/ports/IMessageProvider.js';
import type { IMessageGenerator } from '#application/ports/IMessageGenerator.js';
import type { IMessageSender } from '#application/ports/IMessageSender.js';
import type { IMessageRepository } from '#application/ports/IMessageRepository.js';
import type { IConversationRepository } from '#application/ports/IConversationRepository.js';
import { EligibilityService } from '#application/services/EligibilityService.js';
import { MessageSelectionService } from '#application/services/MessageSelectionService.js';
import { IntroductionMessageService } from '#application/services/IntroductionMessageService.js';
import { Message } from '#domain/entities/Message.js';
import { MessageId } from '#domain/value-objects/MessageId.js';
import { MessageType } from '#domain/enums/MessageType.js';
import { SendStatus } from '#domain/enums/SendStatus.js';
import type { ILogger } from '#application/ports/ILogger.js';

/**
 * Primary application use case orchestrating the daily streak message automation workflow.
 */
export class SendDailyMessagesUseCase {
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
    this.logger?.info('Starting daily streak messages automation workflow.');

    const isSessionActive = await this.eligibilityService.isSessionValid();
    if (!isSessionActive) {
      this.logger?.error('Automation session is invalid or expired. Aborting daily execution.');
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

      if (!this.eligibilityService.isEligible(conversation, executedAt)) {
        skippedConversations++;
        continue;
      }

      try {
        const hasIntro = await this.messageRepository.hasReceivedIntroductionMessage(conversation.id);
        let messageToSend: Message;

        if (!hasIntro) {
          this.logger?.info(
            `Conversation ${conversation.id.getValue()} has not received introduction. Generating intro message.`,
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

        const sendResult = await this.messageSender.sendMessage(conversation, messageToSend);

        if (sendResult.success) {
          messageToSend.markAsSent(sendResult.sentAt ?? new Date());
          conversation.recordMessageSent(messageToSend.sentAt);
          sentMessages++;
          this.logger?.info(`Successfully sent streak message to conversation ${conversation.id.getValue()}.`);
        } else {
          messageToSend.markAsFailed(sendResult.errorMessage ?? 'Failed to deliver message.');
          failedMessages++;
          this.logger?.warn(
            `Failed to send message to conversation ${conversation.id.getValue()}: ${sendResult.errorMessage}`,
          );
        }

        await this.messageRepository.save(messageToSend);
        if (this.conversationRepository) {
          await this.conversationRepository.update(conversation);
        }
      } catch (err) {
        failedMessages++;
        this.logger?.error(`Error processing conversation ${conversation.id.getValue()}`, err);
      }
    }

    const durationMs = Date.now() - startTime;
    this.logger?.info(
      `Daily execution complete. Processed: ${processedConversations}, Sent: ${sentMessages}, Failed: ${failedMessages}, Skipped: ${skippedConversations}.`,
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
}
