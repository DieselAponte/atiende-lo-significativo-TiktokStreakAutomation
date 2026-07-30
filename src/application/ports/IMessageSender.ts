import { Conversation } from '#domain/entities/Conversation.js';
import { Message } from '#domain/entities/Message.js';
import type { SendMessageResultDto } from '#application/dto/SendMessageResult.dto.js';

/**
 * Port interface contract for sending a Message entity to a Conversation.
 */
export interface IMessageSender {
  /**
   * Dispatches the given Message to the specified Conversation.
   */
  sendMessage(conversation: Conversation, message: Message): Promise<SendMessageResultDto>;
}
