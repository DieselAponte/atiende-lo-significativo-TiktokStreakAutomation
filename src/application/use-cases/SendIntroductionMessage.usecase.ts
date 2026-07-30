import type { SendMessageResultDto } from '#application/dto/SendMessageResult.dto.js';
import type { IConversationRepository } from '#application/ports/IConversationRepository.js';
import type { IMessageRepository } from '#application/ports/IMessageRepository.js';
import type { IMessageSender } from '#application/ports/IMessageSender.js';
import { IntroductionMessageService } from '#application/services/IntroductionMessageService.js';
import { ConversationId } from '#domain/value-objects/ConversationId.js';
import { MessageId } from '#domain/value-objects/MessageId.js';
import { Message } from '#domain/entities/Message.js';
import { MessageType } from '#domain/enums/MessageType.js';
import { SendStatus } from '#domain/enums/SendStatus.js';
import { InvalidConversationError } from '#domain/errors/InvalidConversationError.js';
import type { ILogger } from '#application/ports/ILogger.js';

/**
 * Use case for sending the initial introduction message to a conversation.
 */
export class SendIntroductionMessageUseCase {
  public constructor(
    private readonly conversationRepository: IConversationRepository,
    private readonly messageRepository: IMessageRepository,
    private readonly introductionMessageService: IntroductionMessageService,
    private readonly messageSender: IMessageSender,
    private readonly logger?: ILogger,
  ) {}

  public async execute(conversationIdStr: string): Promise<SendMessageResultDto> {
    const conversationId = ConversationId.create(conversationIdStr);
    const conversation = await this.conversationRepository.findById(conversationId);

    if (!conversation) {
      throw new InvalidConversationError(`Conversation with ID ${conversationIdStr} not found.`);
    }

    const hasIntro = await this.messageRepository.hasReceivedIntroductionMessage(conversationId);
    if (hasIntro) {
      this.logger?.warn(`Conversation ${conversationIdStr} has already received an introduction message.`);
      return {
        conversationId: conversationIdStr,
        messageId: '',
        success: false,
        errorMessage: 'Introduction message already sent to this conversation.',
      };
    }

    const content = this.introductionMessageService.buildIntroductionContent(conversation);
    const message = Message.create({
      id: MessageId.generate(),
      conversationId: conversation.id,
      type: MessageType.CURIOSITY,
      content,
      status: SendStatus.PENDING,
    });

    this.logger?.info(`Sending introduction message to conversation ${conversationIdStr}.`);
    const sendResult = await this.messageSender.sendMessage(conversation, message);

    if (sendResult.success) {
      message.markAsSent(sendResult.sentAt ?? new Date());
      conversation.recordMessageSent(message.sentAt);
      await this.conversationRepository.update(conversation);
    } else {
      message.markAsFailed(sendResult.errorMessage ?? 'Failed to send introduction message.');
    }

    await this.messageRepository.save(message);
    return sendResult;
  }
}
