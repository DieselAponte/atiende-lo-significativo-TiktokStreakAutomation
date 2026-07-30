import type { IMessageProvider } from '#application/ports/message-provider.port.js';
import type { MessageContent } from '#providers/base/MessageContent.model.js';
import { ApiNinjasClient } from '#providers/curiosity/api-ninjas/apiNinjas.client.js';
import { CuriosityMapper } from '#providers/curiosity/curiosity.mapper.js';

/**
 * Primary curiosity content provider using API Ninjas Facts.
 */
export class ApiNinjasCuriosityProvider implements IMessageProvider {
  public constructor(private readonly client: ApiNinjasClient = new ApiNinjasClient()) {}

  public async fetchContent(): Promise<MessageContent> {
    const facts = await this.client.fetchFact(1);
    const factDto = facts[0];

    if (!factDto) {
      throw new Error('API Ninjas returned empty facts response.');
    }

    return CuriosityMapper.fromApiNinjas(factDto);
  }
}
