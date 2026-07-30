import type { MessageContent } from '#providers/base/MessageContent.model.js';
import { MessageType } from '#domain/enums/MessageType.js';
import type { NasaApodResponse } from '#providers/science/nasa/nasa.client.js';

/**
 * Mapper converting raw NasaApodResponse DTOs to standard MessageContent.
 */
export class NasaMapper {
  public static toMessageContent(raw: NasaApodResponse): MessageContent {
    return {
      content: raw.explanation.trim(),
      title: raw.title.trim(),
      author: raw.copyright ? raw.copyright.trim() : 'NASA',
      source: 'NASA Astronomy Picture of the Day',
      category: MessageType.SCIENCE,
      metadata: {
        date: raw.date,
        mediaType: raw.media_type,
        url: raw.url,
        ...(raw.hdurl ? { hdurl: raw.hdurl } : {}),
      },
    };
  }
}
