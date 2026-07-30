import type { IMessageProvider } from '#application/ports/message-provider.port.js';
import type { MessageContent } from '#providers/base/MessageContent.model.js';
import { ProviderUnavailableError } from '#providers/base/errors/ProviderUnavailableError.js';
import { NasaScienceProvider } from '#providers/science/nasa/nasaScience.provider.js';
import { OpenAlexResearchProvider } from '#providers/science/openalex/openAlexResearch.provider.js';
import type { ILogger } from '#application/ports/ILogger.js';

/**
 * Science composite provider orchestrating primary (NASA) and fallback (OpenAlex) providers with error resilience.
 */
export class ScienceCompositeProvider implements IMessageProvider {
  private readonly providers: IMessageProvider[];

  public constructor(
    providers?: IMessageProvider[],
    private readonly logger?: ILogger,
  ) {
    this.providers = providers ?? [
      new NasaScienceProvider(),
      new OpenAlexResearchProvider(),
    ];
  }

  public async fetchContent(category?: string): Promise<MessageContent> {
    const errors: Array<{ providerName: string; error: unknown }> = [];

    for (const provider of this.providers) {
      const providerName = provider.constructor.name;
      try {
        this.logger?.info(`Attempting to fetch science content via ${providerName}...`);
        return await provider.fetchContent(category);
      } catch (err) {
        this.logger?.warn(`Science provider ${providerName} failed. Falling back to next provider.`, { error: err });
        errors.push({ providerName, error: err });
      }
    }

    throw new ProviderUnavailableError(
      `All science providers failed. Detailed errors: ${JSON.stringify(errors)}`,
      'ScienceCompositeProvider',
      'OUTAGE',
    );
  }
}
