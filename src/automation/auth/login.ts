import type { Page } from 'playwright';
import { COMMON_SELECTORS } from '#automation/selectors/common.selectors.js';
import { LOGIN_SELECTORS } from '#automation/selectors/login.selectors.js';
import type { ILogger } from '#application/ports/ILogger.js';

export interface LoginOptions {
  username?: string;
  password?: string;
  sessionPath?: string;
}

/**
 * Automates TikTok authentication flow, credentials submission, and session verification.
 */
export class TikTokLogin {
  public constructor(private readonly logger?: ILogger) {}

  /**
   * Navigates to TikTok, performs credential login or waits for interactive login,
   * and verifies authentication success.
   */
  public async login(page: Page, options?: LoginOptions): Promise<boolean> {
    const username = options?.username ?? process.env.TIKTOK_USERNAME;
    const password = options?.password ?? process.env.TIKTOK_PASSWORD;

    this.logger?.info('Navigating to TikTok home page...');
    await page.goto('https://www.tiktok.com', { waitUntil: 'domcontentloaded' });

    // Accept cookie banner if present
    const cookieBanner = page.locator(COMMON_SELECTORS.COOKIE_BANNER_ACCEPT);
    if (await cookieBanner.isVisible({ timeout: 3000 }).catch(() => false)) {
      await cookieBanner.click().catch(() => {});
    }

    // Check if already authenticated
    const isLoggedIn = await page
      .locator(LOGIN_SELECTORS.LOGGED_IN_USER_AVATAR)
      .isVisible({ timeout: 5000 })
      .catch(() => false);

    if (isLoggedIn) {
      this.logger?.info('Already authenticated in active browser context.');
      if (options?.sessionPath) {
        await page.context().storageState({ path: options.sessionPath });
      }
      return true;
    }

    // Open login modal
    const loginButton = page.locator(COMMON_SELECTORS.LOGIN_BUTTON_HEADER);
    if (await loginButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await loginButton.click();
    }

    if (username && password) {
      this.logger?.info('Attempting automated credential login...');
      await page.locator(LOGIN_SELECTORS.USE_PHONE_EMAIL_USERNAME_BUTTON).click().catch(() => {});
      await page.locator(LOGIN_SELECTORS.LOGIN_WITH_EMAIL_OR_USERNAME_TAB).click().catch(() => {});

      await page.locator(LOGIN_SELECTORS.USERNAME_OR_EMAIL_INPUT).fill(username);
      await page.locator(LOGIN_SELECTORS.PASSWORD_INPUT).fill(password);
      await page.locator(LOGIN_SELECTORS.LOGIN_SUBMIT_BUTTON).click();

      // Check for login errors
      const errorTip = page.locator(LOGIN_SELECTORS.ERROR_MESSAGE_CONTAINER);
      if (await errorTip.isVisible({ timeout: 4000 }).catch(() => false)) {
        const errorText = await errorTip.innerText().catch(() => 'Unknown login error');
        this.logger?.error(`TikTok login failed: ${errorText}`);
        return false;
      }
    } else {
      this.logger?.info('No credentials provided. Waiting for interactive user login...');
    }

    // Wait for post-login user avatar verification element
    this.logger?.info('Waiting for post-login user avatar verification...');
    try {
      await page.waitForSelector(LOGIN_SELECTORS.LOGGED_IN_USER_AVATAR, { timeout: 60000 });
      this.logger?.info('Authentication successful.');
      if (options?.sessionPath) {
        await page.context().storageState({ path: options.sessionPath });
      }
      return true;
    } catch {
      this.logger?.error('Login verification timed out.');
      return false;
    }
  }
}
