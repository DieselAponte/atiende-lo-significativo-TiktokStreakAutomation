import type { IMessageProvider } from '#application/ports/IMessageProvider.js';
import type { MessageContent } from '#providers/base/MessageContent.model.js';
import { MessageType } from '#domain/enums/MessageType.js';

/**
 * Strategy interface for selecting content providers adhering to the Open/Closed Principle.
 */
export interface ProviderSelectionStrategy {
  selectProvider(providers: Map<MessageType | string, IMessageProvider>): IMessageProvider;
}

/**
 * Default random provider selection strategy.
 */
export class RandomProviderSelectionStrategy implements ProviderSelectionStrategy {
  public selectProvider(providers: Map<MessageType | string, IMessageProvider>): IMessageProvider {
    const values = Array.from(providers.values());
    if (values.length === 0) {
      throw new Error('No providers registered in ProviderSelectionStrategy.');
    }
    const idx = Math.floor(Math.random() * values.length);
    const selected = values[idx];
    if (!selected) {
      throw new Error('Failed to pick a valid provider from strategy map.');
    }
    return selected;
  }
}

/**
 * Application service responsible for choosing and delegating requests to content providers.
 */
export class ProviderSelectionService implements IMessageProvider {
  private readonly providersMap = new Map<MessageType | string, IMessageProvider>();

  public constructor(
    providers: Map<MessageType | string, IMessageProvider> | Record<string, IMessageProvider>,
    private readonly strategy: ProviderSelectionStrategy = new RandomProviderSelectionStrategy(),
  ) {
    if (providers instanceof Map) {
      this.providersMap = providers;
    } else {
      for (const [key, provider] of Object.entries(providers)) {
        this.providersMap.set(key, provider);
      }
    }
  }

  /**
   * Fetches content from a category-specific provider or using the active selection strategy.
   */
  public async fetchContent(category?: MessageType | string): Promise<MessageContent> {
    if (category && this.providersMap.has(category)) {
      const selectedProvider = this.providersMap.get(category)!;
      return selectedProvider.fetchContent(category);
    }

    const provider = this.strategy.selectProvider(this.providersMap);
    return provider.fetchContent(category);
  }

  public getProviderForCategory(category: MessageType | string): IMessageProvider | undefined {
    return this.providersMap.get(category);
  }
}
