import type { MessageContent } from '#providers/base/MessageContent.model.js';
import { MessageType } from '#domain/enums/MessageType.js';
import type { OpenAlexWorkDto } from '#providers/science/openalex/openAlex.client.js';

/**
 * Mapper for reconstructing OpenAlex abstracts from inverted indexes and mapping to MessageContent.
 */
export class OpenAlexMapper {
  /**
   * Reconstructs linear readable text from OpenAlex's abstract_inverted_index representation.
   */
  public static reconstructAbstract(invertedIndex?: Record<string, number[]>): string {
    if (!invertedIndex) return '';

    const wordsByPosition: string[] = [];

    for (const [word, positions] of Object.entries(invertedIndex)) {
      for (const pos of positions) {
        wordsByPosition[pos] = word;
      }
    }

    return wordsByPosition.filter((w) => w !== undefined).join(' ').trim();
  }

  public static toMessageContent(raw: OpenAlexWorkDto): MessageContent {
    const reconstructedAbstract = OpenAlexMapper.reconstructAbstract(raw.abstract_inverted_index);

    const authorsList = raw.authorships?.map((a) => a.author.display_name).slice(0, 3).join(', ');
    const authorText = authorsList ? `Authors: ${authorsList}` : 'Academic Researchers';

    const contentText = reconstructedAbstract
      ? `${raw.title.trim()}\n\nAbstract: ${reconstructedAbstract.slice(0, 350).trim()}...`
      : raw.title.trim();

    return {
      content: contentText,
      title: raw.title.trim(),
      author: authorText,
      source: 'OpenAlex Academic Graph',
      category: MessageType.SCIENCE,
      metadata: {
        workId: raw.id,
        ...(raw.publication_date ? { publicationDate: raw.publication_date } : {}),
        ...(raw.doi ? { doi: raw.doi } : {}),
        ...(raw.primary_location?.landing_page_url ? { url: raw.primary_location.landing_page_url } : {}),
      },
    };
  }
}
