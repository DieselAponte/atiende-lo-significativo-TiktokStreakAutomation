import fs from 'node:fs';
import path from 'node:path';
import pino, { type Logger as PinoInstance } from 'pino';
import type { ILogger } from '#application/ports/ILogger.js';

/**
 * Centralized Pino logging implementation for the TikTok Streak Automation system.
 * Writes structured log events to both stdout and a persistent file (`logs/execution.log`).
 */
export class ExecutionLogger implements ILogger {
  private static instance: ExecutionLogger | null = null;
  private readonly pinoLogger: PinoInstance;

  public constructor(logFilePath?: string) {
    const logsDir = path.resolve(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    const filePath = logFilePath ?? path.join(logsDir, 'execution.log');
    const fileStream = fs.createWriteStream(filePath, { flags: 'a' });

    this.pinoLogger = pino(
      {
        level: process.env.LOG_LEVEL ?? 'info',
        timestamp: pino.stdTimeFunctions.isoTime,
      },
      pino.multistream([
        { stream: process.stdout },
        { stream: fileStream },
      ]),
    );
  }

  /**
   * Singleton factory method for obtaining global ExecutionLogger instance.
   */
  public static getInstance(): ExecutionLogger {
    if (!ExecutionLogger.instance) {
      ExecutionLogger.instance = new ExecutionLogger();
    }
    return ExecutionLogger.instance;
  }

  public info(message: string, context?: Record<string, unknown>): void {
    if (context) {
      this.pinoLogger.info(context, message);
    } else {
      this.pinoLogger.info(message);
    }
  }

  public warn(message: string, context?: Record<string, unknown>): void {
    if (context) {
      this.pinoLogger.warn(context, message);
    } else {
      this.pinoLogger.warn(message);
    }
  }

  public error(message: string, error?: Error | unknown, context?: Record<string, unknown>): void {
    const errObj = error instanceof Error ? { err: { message: error.message, stack: error.stack } } : { error };
    this.pinoLogger.error({ ...context, ...errObj }, message);
  }

  public debug(message: string, context?: Record<string, unknown>): void {
    if (context) {
      this.pinoLogger.debug(context, message);
    } else {
      this.pinoLogger.debug(message);
    }
  }

  /**
   * Semantic logger helper: Execution start.
   */
  public logExecutionStart(): void {
    this.info('🚀 Automation execution started');
  }

  /**
   * Semantic logger helper: Execution end.
   */
  public logExecutionEnd(durationMs: number): void {
    this.info(`🏁 Automation execution completed in ${durationMs}ms`);
  }

  /**
   * Semantic logger helper: Authentication/Login result.
   */
  public logLogin(username: string, success: boolean): void {
    if (success) {
      this.info(`🔑 Login successful for user: ${username}`);
    } else {
      this.error(`❌ Login failed for user: ${username}`);
    }
  }

  /**
   * Semantic logger helper: Session restoration result.
   */
  public logSessionRestore(success: boolean): void {
    if (success) {
      this.info('🔓 Session restored successfully from storageState');
    } else {
      this.warn('⚠️ Session restoration failed or state expired');
    }
  }

  /**
   * Semantic logger helper: Browser initialization.
   */
  public logBrowserOpen(): void {
    this.info('🌐 Chromium browser instance launched');
  }

  /**
   * Semantic logger helper: Navigation.
   */
  public logNavigation(url: string): void {
    this.info(`🧭 Navigating to: ${url}`);
  }

  /**
   * Semantic logger helper: Total inbox conversations found.
   */
  public logConversationsFound(total: number): void {
    this.info(`📥 Conversations found in inbox: ${total}`);
  }

  /**
   * Semantic logger helper: Streak conversations identified.
   */
  public logStreakConversationsFound(count: number): void {
    this.info(`🔥 Active streak conversations identified: ${count}`);
  }

  /**
   * Semantic logger helper: Message dispatch result.
   */
  public logMessageSent(conversationId: string, success: boolean, errorMessage?: string): void {
    if (success) {
      this.info(`💬 Message successfully sent to conversation: ${conversationId}`);
    } else {
      this.error(`❌ Failed to send message to conversation: ${conversationId}`, undefined, { errorMessage });
    }
  }

  /**
   * Semantic logger helper: Operation duration tracking.
   */
  public logOperationDuration(operationName: string, durationMs: number): void {
    this.info(`⏱️ Operation '${operationName}' completed in ${durationMs}ms`);
  }
}
