import type { HttpRequestOptions } from '#providers/base/provider.types.js';

/**
 * Custom error thrown on HTTP request failure or non-ok response.
 */
export class HttpError extends Error {
  public constructor(
    message: string,
    public readonly statusCode: number,
    public readonly url: string,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

/**
 * Encapsulated HTTP client wrapping native fetch with headers, timeout, and structured error handling.
 */
export class HttpClient {
  private readonly defaultTimeoutMs: number;

  public constructor(defaultTimeoutMs = 10000) {
    this.defaultTimeoutMs = defaultTimeoutMs;
  }

  /**
   * Performs an HTTP GET request and returns parsed JSON.
   */
  public async get<T>(url: string, options?: HttpRequestOptions): Promise<T> {
    const timeout = options?.timeoutMs ?? this.defaultTimeoutMs;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'User-Agent': 'TikTokStreakAutomation/1.0',
          ...options?.headers,
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new HttpError(
          `HTTP Request failed with status ${response.status}: ${response.statusText}`,
          response.status,
          url,
        );
      }

      return (await response.json()) as T;
    } catch (err) {
      if (err instanceof HttpError) {
        throw err;
      }
      if (err instanceof Error && err.name === 'AbortError') {
        throw new HttpError(`HTTP Request timed out after ${timeout}ms`, 408, url);
      }
      throw new HttpError(
        `HTTP Request failed: ${err instanceof Error ? err.message : String(err)}`,
        500,
        url,
      );
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
