/**
 * Common Playwright and DOM selectors for TikTok web interface navigation and dialogs.
 */
export const COMMON_SELECTORS = {
  COOKIE_BANNER_ACCEPT: 'button[data-e2e="cookie-banner-accept"], button:has-text("Accept all")',
  MODAL_CLOSE_BUTTON: '[data-e2e="modal-close-inner"], button[aria-label="Close"]',
  NAV_INBOX_LINK: 'a[href*="/messages"], [data-e2e="nav-messages"], a[aria-label*="Inbox"]',
  USER_AVATAR_HEADER: '[data-e2e="profile-icon"], img[class*="avatar"]',
  LOGIN_BUTTON_HEADER: '[data-e2e="top-login-button"], button:has-text("Log in")',
} as const;
