import type { MessageContent } from '#providers/base/MessageContent.model.js';

export interface MessagePipelineOptions {
  readonly maxLength?: number;
}

/**
 * Application service responsible for content sanitization, HTML tag stripping, whitespace normalization, and max length validation.
 */
export class MessagePipeline {
  private readonly defaultMaxLength = 1000;

  /**
   * Sanitizes and normalizes a raw MessageContent item while preserving metadata.
   */
  public process(contentItem: MessageContent, options?: MessagePipelineOptions): MessageContent {
    const maxLength = options?.maxLength ?? this.defaultMaxLength;

    let sanitizedText = contentItem.content;

    // 1. Strip HTML tags
    sanitizedText = sanitizedText.replace(/<[^>]*>/g, ' ');

    // 2. Normalize line breaks and remove duplicate spaces
    sanitizedText = sanitizedText
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]+/g, ' ')
      .trim();

    // 3. Validate and enforce max length limits
    if (sanitizedText.length > maxLength) {
      sanitizedText = `${sanitizedText.slice(0, maxLength - 4).trim()}...`;
    }

    return {
      ...contentItem,
      content: sanitizedText,
      ...(contentItem.title !== undefined ? { title: contentItem.title.trim() } : {}),
      ...(contentItem.author !== undefined ? { author: contentItem.author.trim() } : {}),
    };
  }
}
