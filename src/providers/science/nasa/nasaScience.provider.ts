import type { IMessageProvider } from '#application/ports/message-provider.port.js';
import type { MessageContent } from '#providers/base/MessageContent.model.js';
import { NasaClient } from '#providers/science/nasa/nasa.client.js';
import { NasaMapper } from '#providers/science/nasa/nasa.mapper.js';

/**
 * Science provider adapter for NASA Astronomy Picture of the Day.
 */
export class NasaScienceProvider implements IMessageProvider {
  public constructor(private readonly client: NasaClient = new NasaClient()) {}

  public async fetchContent(): Promise<MessageContent> {
    const response = await this.client.fetchApod();
    return NasaMapper.toMessageContent(response);
  }
}
