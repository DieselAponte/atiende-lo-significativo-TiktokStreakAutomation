import { ProviderError } from '#providers/base/errors/ProviderError.js';

/**
 * Thrown when a content provider is unavailable due to timeouts, rate limits, or network outages.
 */
export class ProviderUnavailableError extends ProviderError {
  public constructor(
    message: string,
    providerName: string,
    public readonly reason: 'TIMEOUT' | 'RATE_LIMIT' | 'OUTAGE' | 'UNKNOWN',
    originalError?: unknown,
  ) {
    super(message, providerName, originalError);
    this.name = 'ProviderUnavailableError';
  }
}
