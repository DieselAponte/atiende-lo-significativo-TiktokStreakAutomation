/**
 * Data Transfer Object representing the summary metrics of a daily streak execution run.
 */
export interface DailyExecutionResultDto {
  readonly processedConversations: number;
  readonly sentMessages: number;
  readonly failedMessages: number;
  readonly skippedConversations: number;
  readonly executedAt: Date;
  readonly durationMs: number;
}
