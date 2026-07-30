import { MessageType } from '#domain/enums/MessageType.js';

/**
 * Data Transfer Object representing the result of message generation.
 */
export interface GenerateMessageResponseDto {
  readonly messageId: string;
  readonly conversationId: string;
  readonly type: MessageType;
  readonly content: string;
  readonly createdAt: Date;
}
