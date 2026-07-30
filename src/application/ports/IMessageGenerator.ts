import { Conversation } from '#domain/entities/Conversation.js';
import { Message } from '#domain/entities/Message.js';
import { MessageType } from '#domain/enums/MessageType.js';

/**
 * Port interface contract for building structured Message domain entities.
 */
export interface IMessageGenerator {
  /**
   * Generates a Message entity tailored for the target Conversation.
   */
  generateForConversation(conversation: Conversation, type?: MessageType): Promise<Message>;
}
