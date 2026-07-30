import type { GenerateMessageRequestDto } from '#application/dto/GenerateMessageRequest.dto.js';
import type { GenerateMessageResponseDto } from '#application/dto/GenerateMessageResponse.dto.js';
import type { IConversationRepository } from '#application/ports/IConversationRepository.js';
import type { IMessageGenerator } from '#application/ports/IMessageGenerator.js';
import { MessageSelectionService } from '#application/services/MessageSelectionService.js';
import { ConversationId } from '#domain/value-objects/ConversationId.js';
import { InvalidConversationError } from '#domain/errors/InvalidConversationError.js';
import type { ILogger } from '#application/ports/ILogger.js';

/**
 * Use case to generate a Message entity for a specific conversation.
 */
export class GenerateMessageUseCase {
  public constructor(
    private readonly conversationRepository: IConversationRepository,
    private readonly messageSelectionService: MessageSelectionService,
    private readonly messageGenerator: IMessageGenerator,
    private readonly logger?: ILogger,
  ) {}

  public async execute(request: GenerateMessageRequestDto): Promise<GenerateMessageResponseDto> {
    const conversationId = ConversationId.create(request.conversationId);
    const conversation = await this.conversationRepository.findById(conversationId);

    if (!conversation) {
      throw new InvalidConversationError(`Conversation with ID ${request.conversationId} not found.`);
    }

    const messageType = request.messageType ?? this.messageSelectionService.selectMessageType();
    this.logger?.info(`Generating message of type ${messageType} for conversation ${request.conversationId}.`);

    const message = await this.messageGenerator.generateForConversation(conversation, messageType);

    return {
      messageId: message.id.getValue(),
      conversationId: conversation.id.getValue(),
      type: message.type,
      content: message.content,
      createdAt: message.createdAt,
    };
  }
}
