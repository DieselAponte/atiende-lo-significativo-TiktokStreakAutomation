import { ProviderError } from '#providers/base/errors/ProviderError.js';

/**
 * Thrown when an external API returns an HTTP error or unexpected payload structure.
 */
export class ExternalApiError extends ProviderError {
  public constructor(
    message: string,
    providerName: string,
    public readonly statusCode?: number,
    originalError?: unknown,
  ) {
    super(message, providerName, originalError);
    this.name = 'ExternalApiError';
  }
}
