import type { MessageContent } from '#providers/base/MessageContent.model.js';
import { MessageType } from '#domain/enums/MessageType.js';

export interface ApiNinjasFactDto {
  readonly fact: string;
}

export interface UselessFactDto {
  readonly id: string;
  readonly text: string;
  readonly source?: string;
  readonly source_url?: string;
  readonly language?: string;
  readonly permalink?: string;
}

/**
 * Mapper transforming raw Curiosity API responses to standard MessageContent models.
 */
export class CuriosityMapper {
  public static fromApiNinjas(factDto: ApiNinjasFactDto): MessageContent {
    return {
      content: factDto.fact.trim(),
      source: 'API Ninjas Facts',
      category: MessageType.CURIOSITY,
    };
  }

  public static fromUselessFacts(factDto: UselessFactDto): MessageContent {
    return {
      content: factDto.text.trim(),
      source: factDto.source ?? 'Useless Facts API',
      category: MessageType.CURIOSITY,
      metadata: {
        factId: factDto.id,
        ...(factDto.permalink ? { permalink: factDto.permalink } : {}),
      },
    };
  }
}
