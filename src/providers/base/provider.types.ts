/**
 * Provider configuration options.
 */
export interface ProviderOptions {
  readonly apiKey?: string;
  readonly baseUrl?: string;
  readonly timeoutMs?: number;
}

/**
 * Options for HTTP requests inside HttpClient.
 */
export interface HttpRequestOptions {
  readonly headers?: Record<string, string>;
  readonly timeoutMs?: number;
}
