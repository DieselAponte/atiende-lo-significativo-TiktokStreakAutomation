import type { IMessageProvider } from '#application/ports/message-provider.port.js';
import type { MessageContent } from '#providers/base/MessageContent.model.js';
import { UselessFactsClient } from '#providers/curiosity/useless-facts/uselessFacts.client.js';
import { CuriosityMapper } from '#providers/curiosity/curiosity.mapper.js';

/**
 * Fallback curiosity content provider using Useless Facts API.
 */
export class UselessFactsCuriosityProvider implements IMessageProvider {
  public constructor(private readonly client: UselessFactsClient = new UselessFactsClient()) {}

  public async fetchContent(): Promise<MessageContent> {
    const factDto = await this.client.fetchRandomFact();
    return CuriosityMapper.fromUselessFacts(factDto);
  }
}
