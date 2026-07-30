import { MessageType } from '#domain/enums/MessageType.js';

/**
 * Data Transfer Object for requesting message generation for a conversation.
 */
export interface GenerateMessageRequestDto {
  readonly conversationId: string;
  readonly messageType?: MessageType;
}
