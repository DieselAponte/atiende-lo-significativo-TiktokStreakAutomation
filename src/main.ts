import { env, schedulerConfig } from '#config/index.js';
import { ExecutionLogger } from '#automation/diagnostics/executionLogger.js';
import { PrismaService } from '#database/client-prisma.js';
import { createApp } from './app.js';

async function bootstrap() {
  const logger = ExecutionLogger.getInstance();
  logger.info('========== Starting TikTok Streak Automation Runtime ==========');
  logger.info(`Environment: ${env.NODE_ENV}`);

  // 1. Startup Validation: Check Database Connectivity
  try {
    logger.info('Validating database connection...');
    const prisma = PrismaService.getInstance(logger);
    await prisma.$queryRaw`SELECT 1`;
    logger.info('Database connection verified successfully.');
  } catch (err) {
    logger.error('Startup validation failed: unable to connect to database.', err);
    await PrismaService.disconnect(logger);
    process.exit(1);
  }

  // 2. Create Application Composition Root
  const app = createApp();

  // 3. Schedule Daily Job
  if (schedulerConfig.enabled) {
    logger.info(`Scheduling daily job with cron expression: "${schedulerConfig.cronExpression}"`);
    app.cronScheduler.schedule(schedulerConfig.cronExpression, async () => {
      await app.dailyScheduler.executeDailyJob();
    });
    app.cronScheduler.start();
  }

  // 4. Register Signal Handlers & Clean Shutdown
  let isShuttingDown = false;
  const handleShutdown = async (signal: string) => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    logger.info(`Received signal ${signal}. Initiating clean shutdown...`);
    try {
      await app.shutdown();
      logger.info('Exiting process gracefully with exit code 0.');
      process.exit(0);
    } catch (err) {
      logger.error('Error during graceful shutdown execution:', err);
      process.exit(1);
    }
  };

  process.on('SIGINT', () => void handleShutdown('SIGINT'));
  process.on('SIGTERM', () => void handleShutdown('SIGTERM'));

  process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception detected in runtime:', err);
    void handleShutdown('uncaughtException');
  });

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Rejection detected in runtime:', reason);
    void handleShutdown('unhandledRejection');
  });

  logger.info('Runtime bootstrap complete. Service is running autonomously.');
}

void bootstrap();
