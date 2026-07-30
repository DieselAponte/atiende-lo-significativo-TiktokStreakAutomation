import { MessageType } from '#domain/enums/MessageType.js';

/**
 * Port interface contract for retrieving message content items by type (Curiosity, Philosophy, Science).
 */
export interface IMessageProvider {
  /**
   * Retrieves a single candidate message content for the given category.
   */
  getMessageContent(type: MessageType): Promise<string>;

  /**
   * Retrieves all available message contents for the given category.
   */
  getAvailableContents(type: MessageType): Promise<string[]>;
}
