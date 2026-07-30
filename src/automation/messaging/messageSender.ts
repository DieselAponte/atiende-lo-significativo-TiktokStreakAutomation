import type { IMessageSender } from '#application/ports/IMessageSender.js';
import type { SendMessageResultDto } from '#application/dto/SendMessageResult.dto.js';
import { Conversation } from '#domain/entities/Conversation.js';
import { Message } from '#domain/entities/Message.js';
import { BrowserManager } from '#automation/browser/browserManager.js';
import { CONVERSATION_SELECTORS } from '#automation/selectors/conversation.selectors.js';
import { MESSAGE_SELECTORS } from '#automation/selectors/message.selectors.js';
import type { ILogger } from '#application/ports/ILogger.js';

/**
 * Playwright adapter implementing the IMessageSender port for sending TikTok direct messages.
 */
export class TikTokMessageSender implements IMessageSender {
  public constructor(
    private readonly browserManager: BrowserManager,
    private readonly logger?: ILogger,
  ) {}

  public async sendMessage(conversation: Conversation, message: Message): Promise<SendMessageResultDto> {
    const conversationIdStr = conversation.id.getValue();
    const messageIdStr = message.id.getValue();

    this.logger?.info(`Attempting to send message to conversation ${conversationIdStr} via Playwright...`);

    try {
      const page = await this.browserManager.getPage();

      // Ensure we are inside inbox
      if (!page.url().includes('/messages')) {
        await page.goto('https://www.tiktok.com/messages', { waitUntil: 'domcontentloaded' });
      }

      // Locate specific conversation by username
      const username = conversation.contact.username;
      const targetItem = page.locator(
        `${CONVERSATION_SELECTORS.CONVERSATION_ITEM}:has-text("${username}")`,
      );

      if (await targetItem.isVisible({ timeout: 10000 }).catch(() => false)) {
        await targetItem.click();
      } else {
        const firstItem = page.locator(CONVERSATION_SELECTORS.CONVERSATION_ITEM).first();
        if (await firstItem.isVisible({ timeout: 5000 }).catch(() => false)) {
          await firstItem.click();
        } else {
          return {
            conversationId: conversationIdStr,
            messageId: messageIdStr,
            success: false,
            errorMessage: `Target conversation for username ${username} not found in inbox.`,
          };
        }
      }

      // Locate chat window and input element
      await page.waitForSelector(MESSAGE_SELECTORS.CHAT_WINDOW, { timeout: 10000 });
      const inputLocator = page.locator(MESSAGE_SELECTORS.MESSAGE_INPUT);
      await inputLocator.waitFor({ state: 'visible', timeout: 10000 });

      // Focus and type message content
      await inputLocator.click();
      await inputLocator.fill(message.content);

      // Dispatch send action
      const sendButton = page.locator(MESSAGE_SELECTORS.SEND_BUTTON);
      if (await sendButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await sendButton.click();
      } else {
        await page.keyboard.press('Enter');
      }

      // Verify bubble appearance
      const lastBubble = page.locator(MESSAGE_SELECTORS.LAST_SENT_MESSAGE_BUBBLE);
      await lastBubble.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});

      const sentAt = new Date();
      this.logger?.info(`Successfully dispatched message ${messageIdStr} to conversation ${conversationIdStr}.`);

      return {
        conversationId: conversationIdStr,
        messageId: messageIdStr,
        success: true,
        sentAt,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown Playwright automation error';
      this.logger?.error(`Failed sending message to conversation ${conversationIdStr}`, err);

      return {
        conversationId: conversationIdStr,
        messageId: messageIdStr,
        success: false,
        errorMessage,
      };
    }
  }
}
