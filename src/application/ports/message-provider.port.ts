import type { MessageContent } from '#providers/base/MessageContent.model.js';
import type { MessageType } from '#domain/enums/MessageType.js';

/**
 * Common application port contract for content provider adapters.
 */
export interface IMessageProvider {
  /**
   * Fetches a single candidate content item.
   */
  fetchContent(category?: MessageType | string): Promise<MessageContent>;

  /**
   * Optional method to fetch multiple candidate content items.
   */
  fetchAvailableContents?(category?: MessageType | string): Promise<MessageContent[]>;
}
