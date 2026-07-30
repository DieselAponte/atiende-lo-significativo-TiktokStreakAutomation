import type { IConversationReader } from '#application/ports/IConversationReader.js';
import { Conversation } from '#domain/entities/Conversation.js';
import { ConversationId } from '#domain/value-objects/ConversationId.js';
import { Contact } from '#domain/entities/Contact.js';
import { ContactId } from '#domain/value-objects/ContactId.js';
import { Streak } from '#domain/entities/Streak.js';
import { StreakDays } from '#domain/value-objects/StreakDays.js';
import { ConversationPlatform } from '#domain/enums/ConversationPlatform.js';
import { BrowserManager } from '#automation/browser/browserManager.js';
import { StreakDetector } from '#automation/conversations/streakDetector.js';
import { CONVERSATION_SELECTORS } from '#automation/selectors/conversation.selectors.js';
import type { ILogger } from '#application/ports/ILogger.js';

/**
 * Playwright adapter implementing IConversationReader port for reading TikTok conversations.
 */
export class TikTokConversationReader implements IConversationReader {
  private readonly streakDetector = new StreakDetector();

  public constructor(
    private readonly browserManager: BrowserManager,
    private readonly logger?: ILogger,
  ) {}

  public async readAllConversations(): Promise<Conversation[]> {
    this.logger?.info('Navigating to TikTok Direct Messages inbox...');
    const page = await this.browserManager.getPage();
    await page.goto('https://www.tiktok.com/messages', { waitUntil: 'domcontentloaded' });

    await page.waitForSelector(CONVERSATION_SELECTORS.INBOX_CONTAINER, { timeout: 15000 }).catch(() => {
      this.logger?.warn('Inbox container not found within timeout.');
    });

    const items = page.locator(CONVERSATION_SELECTORS.CONVERSATION_ITEM);
    const count = await items.count();
    this.logger?.info(`Found ${count} conversation items in inbox.`);

    const conversations: Conversation[] = [];

    for (let i = 0; i < count; i++) {
      const item = items.nth(i);

      const usernameText = await item
        .locator(CONVERSATION_SELECTORS.CONTACT_USERNAME)
        .innerText()
        .catch(() => '');
      const displayNameText = await item
        .locator(CONVERSATION_SELECTORS.CONTACT_DISPLAY_NAME)
        .innerText()
        .catch(() => '');

      const username = usernameText.trim() || `user_${i + 1}`;
      const displayName = displayNameText.trim() || undefined;

      const streakResult = await this.streakDetector.detectStreak(item);

      const contact = Contact.create({
        id: ContactId.create(`contact_${username}`),
        username,
        ...(displayName !== undefined ? { displayName } : {}),
      });

      const streak = Streak.create({
        days: StreakDays.create(streakResult.daysCount),
        lastInteractionAt: new Date(),
        isActive: streakResult.hasStreak,
      });

      const conversation = Conversation.create({
        id: ConversationId.create(`conv_${username}`),
        contact,
        platform: ConversationPlatform.TIKTOK,
        streak,
      });

      conversations.push(conversation);
    }

    return conversations;
  }

  public async readStreakConversations(): Promise<Conversation[]> {
    const all = await this.readAllConversations();
    return all.filter((conv) => conv.streak.canReceiveStreakMessage());
  }

  public async getConversationById(id: ConversationId): Promise<Conversation | null> {
    const all = await this.readAllConversations();
    return all.find((conv) => conv.id.equals(id)) ?? null;
  }
}
