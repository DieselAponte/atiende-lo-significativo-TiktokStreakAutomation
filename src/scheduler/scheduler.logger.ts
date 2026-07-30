import type { ILogger } from '#application/ports/ILogger.js';

/**
 * Structured logger formatter for scheduler execution lifecycle events.
 */
export class SchedulerLogger {
  public constructor(private readonly logger?: ILogger) {}

  public logJobStart(jobName: string): void {
    this.logger?.info(`[JOB_STARTED] ${jobName}`);
  }

  public logJobCompleted(jobName: string, summary: Record<string, unknown>): void {
    this.logger?.info(`[JOB_COMPLETED] ${jobName}`, summary);
  }

  public logJobFailed(jobName: string, error: unknown): void {
    this.logger?.error(`[JOB_FAILED] ${jobName}`, error);
  }

  public logMessageSent(contactId: string, provider: string): void {
    this.logger?.info(`[MESSAGE_SENT] Contact: ${contactId}, Provider: ${provider}`);
  }

  public logMessageFailed(contactId: string, provider: string, reason: string): void {
    this.logger?.warn(`[MESSAGE_FAILED] Contact: ${contactId}, Provider: ${provider}, Reason: ${reason}`);
  }

  public logMessageSkipped(contactId: string, reason: string): void {
    this.logger?.info(`[MESSAGE_SKIPPED] Contact: ${contactId}, Reason: ${reason}`);
  }
}
