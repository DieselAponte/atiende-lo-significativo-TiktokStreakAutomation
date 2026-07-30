import type { Locator } from 'playwright';
import { CONVERSATION_SELECTORS } from '#automation/selectors/conversation.selectors.js';

export interface StreakDetectionResult {
  hasStreak: boolean;
  daysCount: number;
}

/**
 * Visual streak detector for TikTok Direct Message conversation list items.
 */
export class StreakDetector {
  /**
   * Inspects a conversation DOM item locator to detect if an active streak exists and its day count.
   */
  public async detectStreak(itemLocator: Locator): Promise<StreakDetectionResult> {
    const fireIcon = itemLocator.locator(CONVERSATION_SELECTORS.STREAK_FIRE_ICON);
    const badge = itemLocator.locator(CONVERSATION_SELECTORS.STREAK_CONTAINER);

    const hasFireIcon = await fireIcon.isVisible().catch(() => false);
    const hasBadge = await badge.isVisible().catch(() => false);

    if (!hasFireIcon && !hasBadge) {
      return { hasStreak: false, daysCount: 0 };
    }

    let daysCount = 1;
    const countLocator = itemLocator.locator(CONVERSATION_SELECTORS.STREAK_COUNT_TEXT);
    if (await countLocator.isVisible().catch(() => false)) {
      const text = await countLocator.innerText().catch(() => '');
      const parsed = parseInt(text.replace(/\D/g, ''), 10);
      if (!isNaN(parsed) && parsed > 0) {
        daysCount = parsed;
      }
    }

    return {
      hasStreak: true,
      daysCount,
    };
  }
}
