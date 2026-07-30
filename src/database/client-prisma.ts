import { PrismaClient } from './generated/prisma/index.js';
import type { ILogger } from '#application/ports/ILogger.js';
import { ExecutionLogger } from '#automation/diagnostics/executionLogger.js';

/**
 * Singleton database service managing the PrismaClient instance, lifecycle, and clean shutdown.
 */
export class PrismaService {
  private static instance: PrismaClient | null = null;

  /**
   * Returns the singleton instance of PrismaClient.
   */
  public static getInstance(logger?: ILogger): PrismaClient {
    if (!PrismaService.instance) {
      const log = logger ?? ExecutionLogger.getInstance();
      log.info('Initializing PrismaClient singleton instance...');

      PrismaService.instance = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
      });

      const shutdown = async () => {
        if (PrismaService.instance) {
          log.info('Disconnecting PrismaClient singleton...');
          await PrismaService.instance.$disconnect();
          PrismaService.instance = null;
        }
      };

      process.on('beforeExit', shutdown);
      process.on('SIGINT', shutdown);
      process.on('SIGTERM', shutdown);
    }

    return PrismaService.instance;
  }

  /**
   * Explicitly disconnects the singleton instance.
   */
  public static async disconnect(logger?: ILogger): Promise<void> {
    if (PrismaService.instance) {
      const log = logger ?? ExecutionLogger.getInstance();
      log.info('Disconnecting PrismaClient...');
      await PrismaService.instance.$disconnect();
      PrismaService.instance = null;
    }
  }
}
