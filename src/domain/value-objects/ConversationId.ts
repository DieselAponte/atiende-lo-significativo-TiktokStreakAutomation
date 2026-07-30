import { randomUUID } from 'node:crypto';
import { InvalidConversationError } from '#domain/errors/InvalidConversationError.js';

/**
 * Value Object representing a unique Conversation Identifier.
 */
export class ConversationId {
  private readonly value: string;

  private constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new InvalidConversationError('ConversationId cannot be empty.');
    }
    this.value = value.trim();
  }

  /**
   * Creates a ConversationId from an existing string.
   */
  public static create(value: string): ConversationId {
    return new ConversationId(value);
  }

  /**
   * Generates a new random UUID ConversationId.
   */
  public static generate(): ConversationId {
    return new ConversationId(randomUUID());
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: ConversationId | null | undefined): boolean {
    if (!other) return false;
    return this.value === other.getValue();
  }

  public toString(): string {
    return this.value;
  }
}
