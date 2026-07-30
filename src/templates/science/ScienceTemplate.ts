import type { ITemplateRenderer } from '#templates/interfaces/ITemplateRenderer.js';
import type { MessageContent } from '#providers/base/MessageContent.model.js';
import type { Conversation } from '#domain/entities/Conversation.js';

/**
 * Template renderer for scientific discoveries and research papers.
 */
export class ScienceTemplate implements ITemplateRenderer {
  public render(contentItem: MessageContent, conversation: Conversation): string {
    const convId = conversation.id.getValue();
    const titleBlock = contentItem.title ? `${contentItem.title}\n\n` : '';

    return (
      `🔬 Ciencia\n\n` +
      `${titleBlock}${contentItem.content}\n\n` +
      `Fuente:\n${contentItem.source}\n\n` +
      `Conversation ID:\n${convId}`
    );
  }
}
