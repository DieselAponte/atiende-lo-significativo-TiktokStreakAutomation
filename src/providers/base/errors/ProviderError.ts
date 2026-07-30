/**
 * Base abstract error class for all content provider execution failures.
 */
export class ProviderError extends Error {
  public constructor(
    message: string,
    public readonly providerName: string,
    public readonly originalError?: unknown,
  ) {
    super(message);
    this.name = 'ProviderError';
  }
}
