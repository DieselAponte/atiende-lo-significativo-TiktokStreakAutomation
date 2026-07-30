/**
 * DOM and Playwright selectors for TikTok Direct Messages inbox and conversation lists.
 */
export const CONVERSATION_SELECTORS = {
  INBOX_CONTAINER: 'div[data-e2e="chat-list"], div[class*="DivChatList"]',
  CONVERSATION_ITEM: 'div[data-e2e="chat-item"], li[class*="LiChatItem"], div[class*="DivChatItem"]',
  CONTACT_USERNAME: '[data-e2e="chat-item-username"], span[class*="SpanUsername"]',
  CONTACT_DISPLAY_NAME: '[data-e2e="chat-item-nickname"], span[class*="SpanNickname"]',
  CONTACT_AVATAR: 'img[data-e2e="chat-item-avatar"]',
  STREAK_CONTAINER: '[data-e2e="streak-badge"], div[class*="Streak"], span:has-text("🔥")',
  STREAK_FIRE_ICON: 'svg[data-e2e="streak-fire-icon"], span:has-text("🔥")',
  STREAK_COUNT_TEXT: '[data-e2e="streak-count"], span[class*="StreakCount"]',
} as const;
