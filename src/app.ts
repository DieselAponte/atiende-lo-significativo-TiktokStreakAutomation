import { ExecutionLogger } from '#automation/diagnostics/executionLogger.js';
import { PrismaService } from '#database/client-prisma.js';
import { PrismaConversationRepository } from '#database/repositories/contact.repository.js';
import { PrismaMessageRepository } from '#database/repositories/message.repository.js';
import { BrowserManager } from '#automation/browser/browserManager.js';
import { TikTokSessionManager } from '#automation/auth/session.js';
import { TikTokConversationReader } from '#automation/conversations/conversationReader.js';
import { TikTokMessageSender } from '#automation/messaging/messageSender.js';
import { ApiNinjasCuriosityProvider } from '#providers/curiosity/api-ninjas/apiNinjasCuriosity.provider.js';
import { WikiquotePhilosophyProvider } from '#providers/philosophy/wikiquote/wikiquotePhilosophy.provider.js';
import { ScienceCompositeProvider } from '#providers/science/science.provider.js';
import { EligibilityService } from '#application/services/EligibilityService.js';
import { MessageSelectionService } from '#application/services/MessageSelectionService.js';
import { IntroductionMessageService } from '#application/services/IntroductionMessageService.js';
import { SendDailyMessagesUseCase } from '#application/use-cases/SendDailyMessages.usecase.js';
import { CronScheduler } from '#scheduler/cron.js';
import { DailyScheduler } from '#scheduler/dailyScheduler.js';
import { InMemorySchedulerLock } from '#scheduler/scheduler.lock.js';
import type { ILogger } from '#application/ports/ILogger.js';
import type { IMessageProvider } from '#application/ports/IMessageProvider.js';
import type { IMessageGenerator } from '#application/ports/IMessageGenerator.js';
import { Message } from '#domain/entities/Message.js';
import { MessageId } from '#domain/value-objects/MessageId.js';
import { MessageType } from '#domain/enums/MessageType.js';
import { SendStatus } from '#domain/enums/SendStatus.js';

export interface ApplicationInstance {
  readonly logger: ILogger;
  readonly cronScheduler: CronScheduler;
  readonly dailyScheduler: DailyScheduler;
  readonly browserManager: BrowserManager;
  readonly shutdown: () => Promise<void>;
}

/**
 * Composition Root assembling all application dependencies and returning an ApplicationInstance.
 */
export function createApp(): ApplicationInstance {
  const logger = ExecutionLogger.getInstance();
  logger.info('Initializing Application Composition Root (app.ts)...');

  // Infrastructure
  PrismaService.getInstance(logger);
  const conversationRepository = new PrismaConversationRepository(logger);
  const messageRepository = new PrismaMessageRepository(logger);

  const browserManager = new BrowserManager(logger);
  const sessionManager = new TikTokSessionManager(browserManager, undefined, logger);
  const conversationReader = new TikTokConversationReader(browserManager, logger);
  const messageSenderAdapter = new TikTokMessageSender(browserManager, logger);

  // Content Providers
  const curiosityProvider = new ApiNinjasCuriosityProvider();
  const philosophyProvider = new WikiquotePhilosophyProvider();
  const scienceProvider = new ScienceCompositeProvider(undefined, logger);

  // Composite Application MessageProvider adapter
  const compositeMessageProvider: IMessageProvider = {
    async getMessageContent(type: MessageType): Promise<string> {
      if (type === MessageType.PHILOSOPHY) {
        const item = await philosophyProvider.fetchContent();
        return item.content;
      }
      if (type === MessageType.SCIENCE) {
        const item = await scienceProvider.fetchContent();
        return item.content;
      }
      const item = await curiosityProvider.fetchContent();
      return item.content;
    },

    async getAvailableContents(type: MessageType): Promise<string[]> {
      const content = await this.getMessageContent(type);
      return [content];
    },
  };

  // Message Generator Adapter
  const messageGenerator: IMessageGenerator = {
    async generateForConversation(conversation, selectedType) {
      const type = selectedType ?? MessageType.CURIOSITY;
      const contentText = await compositeMessageProvider.getMessageContent(type);
      return Message.create({
        id: MessageId.generate(),
        conversationId: conversation.id,
        type,
        content: contentText,
        status: SendStatus.PENDING,
      });
    },
  };

  // Application Services & Use Cases
  const eligibilityService = new EligibilityService(sessionManager);
  const messageSelectionService = new MessageSelectionService();
  const introductionMessageService = new IntroductionMessageService();

  const sendDailyMessagesUseCase = new SendDailyMessagesUseCase(
    conversationReader,
    eligibilityService,
    messageSelectionService,
    introductionMessageService,
    compositeMessageProvider,
    messageGenerator,
    messageSenderAdapter,
    messageRepository,
    conversationRepository,
    logger,
  );

  // Scheduler & Concurrency Lock
  const lock = new InMemorySchedulerLock();
  const dailyScheduler = new DailyScheduler(sendDailyMessagesUseCase, lock, logger);
  const cronScheduler = new CronScheduler(logger);

  // Clean Shutdown Factory
  const shutdown = async () => {
    logger.info('Executing 5-step clean shutdown sequence...');

    // 1. Stop cron scheduler
    cronScheduler.stop();

    // 2. Wait for active jobs
    let checks = 0;
    while ((await lock.isLocked()) && checks < 10) {
      logger.info('Waiting for active daily scheduler job to complete...');
      await new Promise((resolve) => setTimeout(resolve, 500));
      checks++;
    }

    // 3. Close browser manager
    await browserManager.close();

    // 4. Disconnect Prisma
    await PrismaService.disconnect(logger);

    logger.info('Application shutdown complete.');
  };

  return {
    logger,
    cronScheduler,
    dailyScheduler,
    browserManager,
    shutdown,
  };
}
