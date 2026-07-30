import { randomUUID } from 'node:crypto';
import { InvalidSessionError } from '#domain/errors/InvalidSessionError.js';

/**
 * Value Object representing a unique Session Identifier.
 */
export class SessionId {
  private readonly value: string;

  private constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new InvalidSessionError('SessionId cannot be empty.');
    }
    this.value = value.trim();
  }

  /**
   * Creates a SessionId from an existing string.
   */
  public static create(value: string): SessionId {
    return new SessionId(value);
  }

  /**
   * Generates a new random UUID SessionId.
   */
  public static generate(): SessionId {
    return new SessionId(randomUUID());
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: SessionId | null | undefined): boolean {
    if (!other) return false;
    return this.value === other.getValue();
  }

  public toString(): string {
    return this.value;
  }
}
