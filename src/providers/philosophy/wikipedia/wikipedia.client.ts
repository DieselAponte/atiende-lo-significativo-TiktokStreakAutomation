import { HttpClient } from '#providers/base/http.client.js';
import type { WikipediaSummaryDto } from '#providers/philosophy/philosophy.mapper.js';

/**
 * Client consuming Wikipedia REST API for short author biographies and context.
 */
export class WikipediaClient {
  private readonly baseUrl = 'https://en.wikipedia.org/api/rest_v1/page/summary/';

  public constructor(private readonly httpClient: HttpClient = new HttpClient()) {}

  /**
   * Fetches summary object for a given title/philosopher.
   */
  public async fetchSummary(title: string): Promise<WikipediaSummaryDto | null> {
    const encodedTitle = encodeURIComponent(title.replace(/ /g, '_'));
    const url = `${this.baseUrl}${encodedTitle}`;

    try {
      return await this.httpClient.get<WikipediaSummaryDto>(url);
    } catch {
      return null;
    }
  }
}
