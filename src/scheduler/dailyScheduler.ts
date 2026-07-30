import type { SendDailyMessagesUseCase } from '#application/use-cases/SendDailyMessages.usecase.js';
import type { ISchedulerLock } from '#scheduler/scheduler.lock.js';
import { InMemorySchedulerLock } from '#scheduler/scheduler.lock.js';
import type { ExecutionSummary } from '#scheduler/scheduler.types.js';
import type { ILogger } from '#application/ports/ILogger.js';
import { SchedulerLogger } from '#scheduler/scheduler.logger.js';

/**
 * Orchestrator service managing execution locks, event logging, and daily job execution.
 */
export class DailyScheduler {
  private readonly schedulerLogger: SchedulerLogger;

  public constructor(
    private readonly sendDailyMessagesUseCase: SendDailyMessagesUseCase,
    private readonly lock: ISchedulerLock = new InMemorySchedulerLock(),
    private readonly logger?: ILogger,
  ) {
    this.schedulerLogger = new SchedulerLogger(this.logger);
  }

  /**
   * Executes the daily automated messaging workflow safely.
   */
  public async executeDailyJob(): Promise<ExecutionSummary> {
    const startedAt = new Date();
    this.schedulerLogger.logJobStart('daily-message-job');

    const acquired = await this.lock.acquire();
    if (!acquired) {
      this.logger?.warn('Daily execution skipped: job execution lock is already held by another process.');
      const finishedAt = new Date();
      return {
        startedAt,
        finishedAt,
        durationMs: finishedAt.getTime() - startedAt.getTime(),
        processedContacts: 0,
        sentMessages: 0,
        failedMessages: 0,
        skippedMessages: 0,
        errors: [{ message: 'Execution lock was already acquired.' }],
      };
    }

    try {
      const result = await this.sendDailyMessagesUseCase.execute();
      const finishedAt = new Date();

      const summary: ExecutionSummary = {
        startedAt,
        finishedAt,
        durationMs: result.durationMs,
        processedContacts: result.processedConversations,
        sentMessages: result.sentMessages,
        failedMessages: result.failedMessages,
        skippedMessages: result.skippedConversations,
        errors: [],
      };

      this.schedulerLogger.logJobCompleted('daily-message-job', summary as unknown as Record<string, unknown>);
      return summary;
    } catch (err) {
      const finishedAt = new Date();
      this.schedulerLogger.logJobFailed('daily-message-job', err);

      return {
        startedAt,
        finishedAt,
        durationMs: finishedAt.getTime() - startedAt.getTime(),
        processedContacts: 0,
        sentMessages: 0,
        failedMessages: 1,
        skippedMessages: 0,
        errors: [{ message: err instanceof Error ? err.message : String(err) }],
      };
    } finally {
      await this.lock.release();
    }
  }
}
