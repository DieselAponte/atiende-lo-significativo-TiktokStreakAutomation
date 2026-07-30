import type { MessageContent } from '#providers/base/MessageContent.model.js';
import { MessageType } from '#domain/enums/MessageType.js';

export interface WikiquoteQueryResultDto {
  readonly title: string;
  readonly quoteText: string;
}

export interface WikipediaSummaryDto {
  readonly title: string;
  readonly extract: string;
  readonly description?: string;
}

/**
 * Mapper transforming Wikiquote quotes and Wikipedia summaries to standard MessageContent models.
 */
export class PhilosophyMapper {
  public static toMessageContent(
    quote: WikiquoteQueryResultDto,
    bio?: WikipediaSummaryDto | null,
  ): MessageContent {
    const author = quote.title.replace(/_/g, ' ');
    const bioText = bio?.extract ? ` - ${bio.extract}` : '';
    const fullContent = `"${quote.quoteText.trim()}" — ${author}${bioText}`;

    return {
      content: fullContent,
      author,
      source: 'Wikiquote & Wikipedia API',
      category: MessageType.PHILOSOPHY,
      metadata: {
        authorTitle: quote.title,
        ...(bio?.description ? { description: bio.description } : {}),
      },
    };
  }
}
