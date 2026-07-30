/**
 * Data Transfer Object representing a conversation eligible for daily streak message automation.
 */
export interface EligibleConversationDto {
  readonly conversationId: string;
  readonly contactId: string;
  readonly contactUsername: string;
  readonly contactDisplayName?: string;
  readonly streakDays: number;
  readonly lastMessageSentAt?: Date;
}
