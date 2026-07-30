/**
 * Port interface abstracting application logging.
 * Completely decouples application code from logger implementations (e.g. Pino).
 */
export interface ILogger {
  /**
   * Logs an informational message.
   */
  info(message: string, context?: Record<string, unknown>): void;

  /**
   * Logs a warning message.
   */
  warn(message: string, context?: Record<string, unknown>): void;

  /**
   * Logs an error message and optional Error instance.
   */
  error(message: string, error?: Error | unknown, context?: Record<string, unknown>): void;

  /**
   * Logs a debug message.
   */
  debug(message: string, context?: Record<string, unknown>): void;
}
