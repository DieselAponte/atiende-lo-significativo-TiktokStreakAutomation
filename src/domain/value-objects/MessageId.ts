import { randomUUID } from 'node:crypto';
import { InvalidMessageError } from '#domain/errors/InvalidMessageError.js';

/**
 * Value Object representing a unique Message Identifier.
 */
export class MessageId {
  private readonly value: string;

  private constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new InvalidMessageError('MessageId cannot be empty.');
    }
    this.value = value.trim();
  }

  /**
   * Creates a MessageId from an existing string.
   */
  public static create(value: string): MessageId {
    return new MessageId(value);
  }

  /**
   * Generates a new random UUID MessageId.
   */
  public static generate(): MessageId {
    return new MessageId(randomUUID());
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: MessageId | null | undefined): boolean {
    if (!other) return false;
    return this.value === other.getValue();
  }

  public toString(): string {
    return this.value;
  }
}
