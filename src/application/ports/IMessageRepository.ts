import { Message } from '#domain/entities/Message.js';
import { MessageId } from '#domain/value-objects/MessageId.js';
import { ConversationId } from '#domain/value-objects/ConversationId.js';

/**
 * Port interface contract for Message entity persistence.
 */
export interface IMessageRepository {
  /**
   * Persists a Message entity.
   */
  save(message: Message): Promise<void>;

  /**
   * Retrieves a Message by its unique identifier.
   */
  findById(id: MessageId): Promise<Message | null>;

  /**
   * Retrieves all messages sent to a specific conversation.
   */
  findByConversationId(conversationId: ConversationId): Promise<Message[]>;

  /**
   * Checks if an introduction message has already been recorded for a conversation.
   */
  hasReceivedIntroductionMessage(conversationId: ConversationId): Promise<boolean>;

  /**
   * Checks if an automated message has already been recorded today for a conversation.
   */
  hasReceivedMessageToday(conversationId: ConversationId, referenceDate?: Date): Promise<boolean>;
}
