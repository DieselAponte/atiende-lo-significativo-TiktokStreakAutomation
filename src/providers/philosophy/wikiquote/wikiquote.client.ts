import { HttpClient } from '#providers/base/http.client.js';
import type { WikiquoteQueryResultDto } from '#providers/philosophy/philosophy.mapper.js';

export interface WikiquoteParseResponse {
  readonly parse?: {
    readonly title: string;
    readonly text?: { readonly '*': string };
  };
}

/**
 * Client consuming the Wikiquote Action API for verified quotes.
 */
export class WikiquoteClient {
  private readonly baseUrl = 'https://en.wikiquote.org/w/api.php';

  public constructor(private readonly httpClient: HttpClient = new HttpClient()) {}

  /**
   * Fetches raw quote section text for a philosopher page.
   */
  public async fetchQuoteForPage(pageTitle: string): Promise<WikiquoteQueryResultDto> {
    const params = new URLSearchParams({
      action: 'parse',
      page: pageTitle,
      format: 'json',
      prop: 'text',
      section: '1',
      origin: '*',
    });

    const url = `${this.baseUrl}?${params.toString()}`;
    const data = await this.httpClient.get<WikiquoteParseResponse>(url);

    const rawHtml = data.parse?.text?.['*'] ?? '';
    const quoteText = this.extractQuoteFromHtml(rawHtml) || `Philosophical wisdom by ${pageTitle}`;

    return {
      title: data.parse?.title ?? pageTitle,
      quoteText,
    };
  }

  private extractQuoteFromHtml(html: string): string {
    const cleanText = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const matches = cleanText.match(/"([^"]+)"/) || cleanText.match(/“([^”]+)”/);
    if (matches && matches[1]) {
      return matches[1].trim();
    }
    return cleanText.slice(0, 200).trim();
  }
}
