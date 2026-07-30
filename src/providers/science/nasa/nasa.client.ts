import { HttpClient, HttpError } from '#providers/base/http.client.js';
import { ExternalApiError } from '#providers/base/errors/ExternalApiError.js';
import { ProviderUnavailableError } from '#providers/base/errors/ProviderUnavailableError.js';

export interface NasaApodResponse {
  readonly title: string;
  readonly explanation: string;
  readonly date: string;
  readonly media_type: string;
  readonly url: string;
  readonly hdurl?: string;
  readonly copyright?: string;
}

/**
 * Client for consuming NASA Astronomy Picture of the Day (APOD) API.
 */
export class NasaClient {
  private readonly baseUrl = 'https://api.nasa.gov/planetary/apod';

  public constructor(
    private readonly httpClient: HttpClient = new HttpClient(),
    private readonly apiKey?: string,
  ) {}

  /**
   * Fetches the daily APOD object from NASA.
   */
  public async fetchApod(date?: string): Promise<NasaApodResponse> {
    const key = this.apiKey ?? process.env.NASA_API_KEY ?? 'DEMO_KEY';
    const params = new URLSearchParams({ api_key: key });
    if (date) {
      params.append('date', date);
    }

    const url = `${this.baseUrl}?${params.toString()}`;

    try {
      return await this.httpClient.get<NasaApodResponse>(url);
    } catch (err) {
      if (err instanceof HttpError) {
        if (err.statusCode === 429) {
          throw new ProviderUnavailableError('NASA API rate limit exceeded.', 'NasaClient', 'RATE_LIMIT', err);
        }
        if (err.statusCode === 408) {
          throw new ProviderUnavailableError('NASA API request timed out.', 'NasaClient', 'TIMEOUT', err);
        }
        throw new ExternalApiError(`NASA API HTTP error: ${err.message}`, 'NasaClient', err.statusCode, err);
      }
      throw new ExternalApiError(`Unexpected failure fetching NASA APOD: ${err}`, 'NasaClient', 500, err);
    }
  }
}
