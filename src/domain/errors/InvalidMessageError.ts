import { DomainError } from '#domain/errors/DomainError.js';

/**
 * Thrown when message domain constraints or lifecycle transitions are invalid.
 */
export class InvalidMessageError extends DomainError {
  public constructor(message: string) {
    super(`[InvalidMessageError]: ${message}`);
  }
}
