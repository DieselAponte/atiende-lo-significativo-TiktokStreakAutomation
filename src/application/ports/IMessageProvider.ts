import type { MessageContent } from '#providers/base/MessageContent.model.js';
import type { MessageType } from '#domain/enums/MessageType.js';

/**
 * Single application port interface contract for retrieving structured MessageContent items from content providers.
 */
export interface IMessageProvider {
  /**
   * Fetches a candidate MessageContent item for the specified category or default.
   */
  fetchContent(category?: MessageType | string): Promise<MessageContent>;

  /**
   * Optional method to fetch multiple candidate MessageContent items.
   */
  fetchAvailableContents?(category?: MessageType | string): Promise<MessageContent[]>;
}
