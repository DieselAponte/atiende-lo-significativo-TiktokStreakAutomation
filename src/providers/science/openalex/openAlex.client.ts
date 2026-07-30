import { HttpClient, HttpError } from '#providers/base/http.client.js';
import { ExternalApiError } from '#providers/base/errors/ExternalApiError.js';
import { ProviderUnavailableError } from '#providers/base/errors/ProviderUnavailableError.js';

export interface OpenAlexLocationDto {
  readonly landing_page_url?: string;
  readonly pdf_url?: string;
}

export interface OpenAlexAuthorDto {
  readonly author: {
    readonly display_name: string;
  };
}

export interface OpenAlexWorkDto {
  readonly id: string;
  readonly title: string;
  readonly publication_date?: string;
  readonly doi?: string;
  readonly abstract_inverted_index?: Record<string, number[]>;
  readonly authorships?: OpenAlexAuthorDto[];
  readonly primary_location?: OpenAlexLocationDto;
}

export interface OpenAlexSearchResponse {
  readonly meta: {
    readonly count: number;
  };
  readonly results: OpenAlexWorkDto[];
}

/**
 * Client for consuming OpenAlex academic research works API.
 */
export class OpenAlexClient {
  private readonly baseUrl = 'https://api.openalex.org/works';

  public constructor(private readonly httpClient: HttpClient = new HttpClient()) {}

  /**
   * Fetches academic research works matching a search query.
   */
  public async fetchWorks(searchQuery = 'artificial intelligence', perPage = 5): Promise<OpenAlexWorkDto[]> {
    const params = new URLSearchParams({
      search: searchQuery,
      'per-page': perPage.toString(),
      filter: 'has_abstract:true',
    });

    const url = `${this.baseUrl}?${params.toString()}`;

    try {
      const response = await this.httpClient.get<OpenAlexSearchResponse>(url, {
        headers: {
          'User-Agent': 'TikTokStreakAutomation/1.0 (mailto:admin@domain.com)',
        },
      });

      return response.results ?? [];
    } catch (err) {
      if (err instanceof HttpError) {
        if (err.statusCode === 429) {
          throw new ProviderUnavailableError('OpenAlex API rate limit exceeded.', 'OpenAlexClient', 'RATE_LIMIT', err);
        }
        if (err.statusCode === 408) {
          throw new ProviderUnavailableError('OpenAlex API request timed out.', 'OpenAlexClient', 'TIMEOUT', err);
        }
        throw new ExternalApiError(`OpenAlex API HTTP error: ${err.message}`, 'OpenAlexClient', err.statusCode, err);
      }
      throw new ExternalApiError(`Unexpected failure fetching OpenAlex works: ${err}`, 'OpenAlexClient', 500, err);
    }
  }
}
