/**
 * DOM and Playwright selectors for TikTok login and authentication dialogs.
 */
export const LOGIN_SELECTORS = {
  MODAL_CONTAINER: '[data-e2e="login-modal"], div[class*="DivLoginContainer"]',
  USE_PHONE_EMAIL_USERNAME_BUTTON: 'div[data-e2e="channel-item"]:has-text("Use phone / email / username"), p:has-text("Use phone / email / username")',
  LOGIN_WITH_EMAIL_OR_USERNAME_TAB: 'a[href*="login/phone-or-email"]:has-text("Log in with email or username"), a:has-text("Log in with email")',
  USERNAME_OR_EMAIL_INPUT: 'input[name="username"], input[placeholder*="Email or username"]',
  PASSWORD_INPUT: 'input[type="password"], input[placeholder*="Password"]',
  LOGIN_SUBMIT_BUTTON: 'button[type="submit"][data-e2e="login-button"], button:has-text("Log in")',
  ERROR_MESSAGE_CONTAINER: '[data-e2e="login-error-tip"], div[class*="DivErrorTip"]',
  LOGGED_IN_USER_AVATAR: '[data-e2e="profile-icon"], a[href*="/@"] img',
} as const;
