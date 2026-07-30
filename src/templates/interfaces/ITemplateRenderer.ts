import type { MessageContent } from '#providers/base/MessageContent.model.js';
import type { Conversation } from '#domain/entities/Conversation.js';

/**
 * Interface contract for template renderers transforming MessageContent and Conversation into formatted TikTok strings.
 */
export interface ITemplateRenderer {
  render(contentItem: MessageContent, conversation: Conversation): string;
}
