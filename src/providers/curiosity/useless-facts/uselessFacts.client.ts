import { HttpClient } from '#providers/base/http.client.js';
import type { UselessFactDto } from '#providers/curiosity/curiosity.mapper.js';

/**
 * Client for consuming the Useless Facts REST API.
 */
export class UselessFactsClient {
  private readonly url = 'https://uselessfacts.jsph.pl/api/v2/facts/random?language=en';

  public constructor(private readonly httpClient: HttpClient = new HttpClient()) {}

  /**
   * Fetches a random fact from Useless Facts API.
   */
  public async fetchRandomFact(): Promise<UselessFactDto> {
    return this.httpClient.get<UselessFactDto>(this.url);
  }
}
