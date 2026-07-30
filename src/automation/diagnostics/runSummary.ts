import type { ILogger } from '#application/ports/ILogger.js';
import { ExecutionLogger } from '#automation/diagnostics/executionLogger.js';

export interface RunSummaryData {
  executionDate: Date;
  startTime: Date;
  endTime?: Date;
  durationMs?: number;
  totalConversationsFound: number;
  eligibleStreakConversations: number;
  messagesSent: number;
  messagesFailed: number;
  errorsEncountered: string[];
}

/**
 * Accumulates metrics and prints structured summary reports for execution runs.
 */
export class RunSummary {
  private readonly data: RunSummaryData;

  public constructor(startTime: Date = new Date()) {
    this.data = {
      executionDate: new Date(),
      startTime,
      totalConversationsFound: 0,
      eligibleStreakConversations: 0,
      messagesSent: 0,
      messagesFailed: 0,
      errorsEncountered: [],
    };
  }

  public recordConversationsFound(count: number): void {
    this.data.totalConversationsFound = count;
  }

  public recordEligibleConversations(count: number): void {
    this.data.eligibleStreakConversations = count;
  }

  public recordMessageSent(): void {
    this.data.messagesSent++;
  }

  public recordMessageFailed(reason?: string): void {
    this.data.messagesFailed++;
    if (reason) {
      this.data.errorsEncountered.push(reason);
    }
  }

  public recordError(error: string): void {
    this.data.errorsEncountered.push(error);
  }

  public complete(endTime: Date = new Date()): void {
    this.data.endTime = endTime;
    this.data.durationMs = endTime.getTime() - this.data.startTime.getTime();
  }

  public getData(): Readonly<RunSummaryData> {
    return { ...this.data };
  }

  /**
   * Logs a formatted execution summary report via ExecutionLogger.
   */
  public print(logger?: ILogger): void {
    const log = logger ?? ExecutionLogger.getInstance();
    const duration = this.data.durationMs ?? Date.now() - this.data.startTime.getTime();

    log.info('====================================================');
    log.info('📊 EXECUTION SUMMARY REPORT');
    log.info('====================================================');
    log.info(`📅 Date: ${this.data.executionDate.toISOString()}`);
    log.info(`⏱️ Duration: ${duration}ms`);
    log.info(`📥 Conversations Found: ${this.data.totalConversationsFound}`);
    log.info(`🔥 Eligible Streak Conversations: ${this.data.eligibleStreakConversations}`);
    log.info(`💬 Messages Sent Successfully: ${this.data.messagesSent}`);
    log.info(`❌ Messages Failed: ${this.data.messagesFailed}`);

    if (this.data.errorsEncountered.length > 0) {
      log.warn(`⚠️ Errors Encountered (${this.data.errorsEncountered.length}):`);
      this.data.errorsEncountered.forEach((err, idx) => {
        log.warn(`   ${idx + 1}. ${err}`);
      });
    }

    log.info('====================================================');
  }
}
