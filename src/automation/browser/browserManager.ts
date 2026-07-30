import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';
import { DEFAULT_LAUNCH_OPTIONS, DEFAULT_CONTEXT_OPTIONS, DEFAULT_TIMEOUT_MS } from '#automation/browser/playwright.js';
import { TraceManager } from '#automation/diagnostics/traceManager.js';
import { ExecutionLogger } from '#automation/diagnostics/executionLogger.js';
import type { ILogger } from '#application/ports/ILogger.js';

/**
 * Manages Chromium browser lifecycle, contexts, pages, timeouts, viewport configurations,
 * and Playwright tracing.
 */
export class BrowserManager {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private readonly traceManager = new TraceManager();
  private readonly logger: ILogger;

  public constructor(logger?: ILogger) {
    this.logger = logger ?? ExecutionLogger.getInstance();
  }

  /**
   * Returns an active Browser instance, launching Chromium if necessary.
   */
  public async getBrowser(): Promise<Browser> {
    if (!this.browser || !this.browser.isConnected()) {
      this.logger.info('Launching Chromium browser instance.');
      this.browser = await chromium.launch(DEFAULT_LAUNCH_OPTIONS);
    }
    return this.browser;
  }

  /**
   * Creates or reuses the BrowserContext, with optional state restoration and tracing activation.
   */
  public async getContext(storageStatePath?: string): Promise<BrowserContext> {
    if (!this.context) {
      const browser = await this.getBrowser();
      const options = {
        ...DEFAULT_CONTEXT_OPTIONS,
        ...(storageStatePath ? { storageState: storageStatePath } : {}),
      };
      this.logger.info('Creating new BrowserContext.', { storageStatePath });
      this.context = await browser.newContext(options);
      this.context.setDefaultTimeout(DEFAULT_TIMEOUT_MS);
      this.context.setDefaultNavigationTimeout(DEFAULT_TIMEOUT_MS);

      await this.traceManager.start(this.context);
    }
    return this.context;
  }

  /**
   * Returns an active Page instance.
   */
  public async getPage(storageStatePath?: string): Promise<Page> {
    if (!this.page || this.page.isClosed()) {
      const context = await this.getContext(storageStatePath);
      this.logger.info('Opening new Page.');
      this.page = await context.newPage();
    }
    return this.page;
  }

  /**
   * Gracefully tears down pages, stops tracing, closes context and browser instance.
   */
  public async close(): Promise<void> {
    this.logger.info('Closing Chromium browser and clearing contexts.');
    if (this.page && !this.page.isClosed()) {
      await this.page.close().catch(() => {});
      this.page = null;
    }
    if (this.context) {
      await this.traceManager.stop(this.context).catch(() => {});
      await this.context.close().catch(() => {});
      this.context = null;
    }
    if (this.browser && this.browser.isConnected()) {
      await this.browser.close().catch(() => {});
      this.browser = null;
    }
  }
}
