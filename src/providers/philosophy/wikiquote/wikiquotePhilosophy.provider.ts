import type { IMessageProvider } from '#application/ports/message-provider.port.js';
import type { MessageContent } from '#providers/base/MessageContent.model.js';
import { WikiquoteClient } from '#providers/philosophy/wikiquote/wikiquote.client.js';
import { WikipediaClient } from '#providers/philosophy/wikipedia/wikipedia.client.js';
import { PhilosophyMapper } from '#providers/philosophy/philosophy.mapper.js';

/**
 * Composite philosophy content provider combining Wikiquote quotes with Wikipedia summaries.
 */
export class WikiquotePhilosophyProvider implements IMessageProvider {
  private readonly philosophers = [
    'Seneca_the_Younger',
    'Epictetus',
    'Marcus_Aurelius',
    'Socrates',
    'Plato',
    'Aristotle',
    'Confucius',
    'Friedrich_Nietzsche',
    'Immanuel_Kant',
    'Baruch_Spinoza',
    'Simone_de_Beauvoir',
  ];

  public constructor(
    private readonly wikiquoteClient: WikiquoteClient = new WikiquoteClient(),
    private readonly wikipediaClient: WikipediaClient = new WikipediaClient(),
  ) {}

  public async fetchContent(authorName?: string): Promise<MessageContent> {
    const selectedAuthor = authorName ?? this.getRandomAuthor();
    const quote = await this.wikiquoteClient.fetchQuoteForPage(selectedAuthor);
    const bio = await this.wikipediaClient.fetchSummary(selectedAuthor);

    return PhilosophyMapper.toMessageContent(quote, bio);
  }

  private getRandomAuthor(): string {
    const idx = Math.floor(Math.random() * this.philosophers.length);
    return this.philosophers[idx] ?? 'Seneca_the_Younger';
  }
}
