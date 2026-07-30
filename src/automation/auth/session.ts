import fs from 'node:fs';
import path from 'node:path';
import type { ISessionManager } from '#application/ports/ISessionManager.js';
import { Session } from '#domain/entities/Session.js';
import { SessionId } from '#domain/value-objects/SessionId.js';
import { ConversationPlatform } from '#domain/enums/ConversationPlatform.js';
import { SessionStatus } from '#domain/enums/SessionStatus.js';
import { BrowserManager } from '#automation/browser/browserManager.js';
import { TikTokLogin } from '#automation/auth/login.js';
import { LOGIN_SELECTORS } from '#automation/selectors/login.selectors.js';
import type { ILogger } from '#application/ports/ILogger.js';

/**
 * Adapter implementing the ISessionManager port for TikTok browser session state.
 */
export class TikTokSessionManager implements ISessionManager {
  private readonly storageStatePath: string;

  public constructor(
    private readonly browserManager: BrowserManager,
    storageStatePath?: string,
    private readonly logger?: ILogger,
  ) {
    this.storageStatePath =
      storageStatePath ?? process.env.SESSION_STORAGE_PATH ?? path.resolve(process.cwd(), 'storageState.json');
  }

  public async getSession(): Promise<Session | null> {
    if (!fs.existsSync(this.storageStatePath)) {
      return null;
    }

    const isValid = await this.validateSession();
    return Session.create({
      id: SessionId.generate(),
      platform: ConversationPlatform.TIKTOK,
      status: isValid ? SessionStatus.ACTIVE : SessionStatus.EXPIRED,
    });
  }

  public async validateSession(): Promise<boolean> {
    if (!fs.existsSync(this.storageStatePath)) {
      this.logger?.warn(`Session storage file not found at ${this.storageStatePath}`);
      return false;
    }

    try {
      const page = await this.browserManager.getPage(this.storageStatePath);
      await page.goto('https://www.tiktok.com/messages', { waitUntil: 'domcontentloaded' });

      const isLoggedIn = await page
        .locator(LOGIN_SELECTORS.LOGGED_IN_USER_AVATAR)
        .isVisible({ timeout: 8000 })
        .catch(() => false);

      if (isLoggedIn) {
        this.logger?.info('Active TikTok session validated successfully.');
        return true;
      }
      this.logger?.warn('TikTok session is invalid or expired.');
      return false;
    } catch (err) {
      this.logger?.error('Error validating TikTok session.', err);
      return false;
    }
  }

  public async renewSession(): Promise<Session> {
    this.logger?.info('Renewing TikTok automation session...');
    const page = await this.browserManager.getPage();
    const login = new TikTokLogin(this.logger);

    const success = await login.login(page, { sessionPath: this.storageStatePath });
    return Session.create({
      id: SessionId.generate(),
      platform: ConversationPlatform.TIKTOK,
      status: success ? SessionStatus.ACTIVE : SessionStatus.INVALID,
    });
  }
}
