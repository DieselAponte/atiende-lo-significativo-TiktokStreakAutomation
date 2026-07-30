/**
 * DOM and Playwright selectors for TikTok Direct Message chat box and message sending controls.
 */
export const MESSAGE_SELECTORS = {
  CHAT_WINDOW: 'div[data-e2e="chat-detail"], div[class*="DivChatDetail"]',
  MESSAGE_INPUT: 'div[contenteditable="true"][data-e2e="chat-input"], textarea[data-e2e="chat-input"], div[contenteditable="true"]',
  SEND_BUTTON: 'button[data-e2e="chat-send-btn"], button[aria-label="Send"], svg[class*="SendIcon"]',
  MESSAGE_LIST: 'div[data-e2e="chat-message-list"], div[class*="DivMessageList"]',
  MESSAGE_ITEM: 'div[data-e2e="chat-message-item"], div[class*="DivMessageItem"]',
  LAST_SENT_MESSAGE_BUBBLE: 'div[data-e2e="chat-message-item"]:last-child, div[class*="MessageSelf"]:last-child',
} as const;
