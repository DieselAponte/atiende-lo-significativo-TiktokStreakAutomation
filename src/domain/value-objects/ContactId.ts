import { randomUUID } from 'node:crypto';
import { InvalidContactError } from '#domain/errors/InvalidContactError.js';

/**
 * Value Object representing a unique Contact Identifier.
 */
export class ContactId {
  private readonly value: string;

  private constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new InvalidContactError('ContactId cannot be empty.');
    }
    this.value = value.trim();
  }

  /**
   * Creates a ContactId from an existing string.
   */
  public static create(value: string): ContactId {
    return new ContactId(value);
  }

  /**
   * Generates a new random UUID ContactId.
   */
  public static generate(): ContactId {
    return new ContactId(randomUUID());
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: ContactId | null | undefined): boolean {
    if (!other) return false;
    return this.value === other.getValue();
  }

  public toString(): string {
    return this.value;
  }
}
