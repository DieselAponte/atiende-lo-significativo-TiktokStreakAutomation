import type { MessageType } from '#domain/enums/MessageType.js';

/**
 * Common content item model returned by content providers.
 */
export interface MessageContent {
  readonly content: string;
  readonly title?: string;
  readonly author?: string;
  readonly source: string;
  readonly category: MessageType | string;
  readonly metadata?: Record<string, unknown>;
}
