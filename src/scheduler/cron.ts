import cron, { type ScheduledTask } from 'node-cron';
import type { ILogger } from '#application/ports/ILogger.js';

/**
 * Cron scheduling wrapper encapsulating node-cron to allow future migration to external queues (BullMQ, Quartz) seamlessly.
 */
export class CronScheduler {
  private task: ScheduledTask | null = null;

  public constructor(private readonly logger?: ILogger) {}

  /**
   * Schedules a task using a cron expression (e.g. "0 10 * * *").
   */
  public schedule(cronExpression: string, callback: () => Promise<void>): void {
    if (this.task) {
      this.stop();
    }

    this.logger?.info(`Scheduling cron task with expression: "${cronExpression}"`);
    this.task = cron.schedule(cronExpression, async () => {
      try {
        await callback();
      } catch (err) {
        this.logger?.error('Unhandled exception during scheduled job execution:', err);
      }
    });
  }

  /**
   * Starts the scheduled cron task.
   */
  public start(): void {
    if (this.task) {
      this.task.start();
      this.logger?.info('Cron scheduler started.');
    }
  }

  /**
   * Stops and destroys the scheduled cron task cleanly.
   */
  public stop(): void {
    if (this.task) {
      this.task.stop();
      this.task = null;
      this.logger?.info('Cron scheduler stopped cleanly.');
    }
  }

  /**
   * Returns true if a task is currently scheduled.
   */
  public isScheduled(): boolean {
    return this.task !== null;
  }
}
