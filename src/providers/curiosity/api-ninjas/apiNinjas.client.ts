import { HttpClient } from '#providers/base/http.client.js';
import type { ApiNinjasFactDto } from '#providers/curiosity/curiosity.mapper.js';

/**
 * Client for interacting with the API Ninjas Facts endpoint.
 */
export class ApiNinjasClient {
  private readonly baseUrl = 'https://api.api-ninjas.com/v1/facts';

  public constructor(
    private readonly httpClient: HttpClient = new HttpClient(),
    private readonly apiKey?: string,
  ) {}

  /**
   * Fetches facts array from API Ninjas.
   */
  public async fetchFact(limit = 1): Promise<ApiNinjasFactDto[]> {
    const apiKey = this.apiKey ?? process.env.API_NINJAS_KEY;
    if (!apiKey) {
      throw new Error('API_NINJAS_KEY environment variable is required to consume API Ninjas Facts.');
    }

    const url = `${this.baseUrl}?limit=${limit}`;
    return this.httpClient.get<ApiNinjasFactDto[]>(url, {
      headers: {
        'X-Api-Key': apiKey,
      },
    });
  }
}
