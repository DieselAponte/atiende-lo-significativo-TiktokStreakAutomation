/**
 * Data Transfer Object representing the result of a message sending operation.
 */
export interface SendMessageResultDto {
  readonly conversationId: string;
  readonly messageId: string;
  readonly success: boolean;
  readonly sentAt?: Date;
  readonly errorMessage?: string;
}
