import type { IMessageProvider } from '#application/ports/message-provider.port.js';
import type { MessageContent } from '#providers/base/MessageContent.model.js';
import { OpenAlexClient } from '#providers/science/openalex/openAlex.client.js';
import { OpenAlexMapper } from '#providers/science/openalex/openAlex.mapper.js';

/**
 * Science research provider adapter using OpenAlex Academic Graph.
 */
export class OpenAlexResearchProvider implements IMessageProvider {
  private readonly topics = [
    'artificial intelligence',
    'quantum computing',
    'climate change solution',
    'robotics innovation',
    'neuroscience discovery',
  ];

  public constructor(private readonly client: OpenAlexClient = new OpenAlexClient()) {}

  public async fetchContent(topic?: string): Promise<MessageContent> {
    const selectedTopic = topic ?? this.getRandomTopic();
    const works = await this.client.fetchWorks(selectedTopic, 5);
    const selectedWork = works[0];

    if (!selectedWork) {
      throw new Error(`OpenAlex returned no research works for topic: ${selectedTopic}`);
    }

    return OpenAlexMapper.toMessageContent(selectedWork);
  }

  private getRandomTopic(): string {
    const idx = Math.floor(Math.random() * this.topics.length);
    return this.topics[idx] ?? 'artificial intelligence';
  }
}
