/**
 * Data Transfer Object carrying target conversation and message identifiers for dispatch.
 */
export interface SendMessageRequestDto {
  readonly conversationId: string;
  readonly messageId: string;
}
