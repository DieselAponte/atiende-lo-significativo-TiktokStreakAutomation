import type { ITemplateRenderer } from '#templates/interfaces/ITemplateRenderer.js';
import type { MessageContent } from '#providers/base/MessageContent.model.js';
import type { Conversation } from '#domain/entities/Conversation.js';

/**
 * Template renderer for curiosity messages.
 */
export class CuriosityTemplate implements ITemplateRenderer {
  public render(contentItem: MessageContent, conversation: Conversation): string {
    const convId = conversation.id.getValue();

    return (
      `🧠 Curiosidad del día\n\n` +
      `${contentItem.content}\n\n` +
      `Fuente:\n${contentItem.source}\n\n` +
      `Conversation ID:\n${convId}`
    );
  }
}
