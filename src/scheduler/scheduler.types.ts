/**
 * Detailed execution summary returned after running a scheduled daily job.
 */
export interface ExecutionSummary {
  readonly startedAt: Date;
  readonly finishedAt: Date;
  readonly durationMs: number;
  readonly processedContacts: number;
  readonly sentMessages: number;
  readonly failedMessages: number;
  readonly skippedMessages: number;
  readonly errors: Array<{ readonly contactId?: string; readonly message: string }>;
}

/**
 * Configuration for cron job scheduling.
 */
export interface JobConfig {
  readonly cronExpression: string;
  readonly enabled: boolean;
  readonly timezone?: string;
}
