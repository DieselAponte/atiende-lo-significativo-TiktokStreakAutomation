import type { LaunchOptions, BrowserContextOptions } from 'playwright';

/**
 * Default Playwright Chromium launch options.
 */
export const DEFAULT_LAUNCH_OPTIONS: LaunchOptions = {
  headless: process.env.HEADLESS !== 'false',
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-blink-features=AutomationControlled',
  ],
};

/**
 * Default Playwright BrowserContext configuration options.
 */
export const DEFAULT_CONTEXT_OPTIONS: BrowserContextOptions = {
  viewport: { width: 1280, height: 800 },
  userAgent:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  locale: 'en-US',
  timezoneId: 'America/New_York',
};

/**
 * Default global timeout setting for browser operations in milliseconds.
 */
export const DEFAULT_TIMEOUT_MS = parseInt(process.env.PLAYWRIGHT_TIMEOUT ?? '30000', 10);
