import { DomainError } from '#domain/errors/DomainError.js';

/**
 * Thrown when contact domain constraints or parameters are invalid.
 */
export class InvalidContactError extends DomainError {
  public constructor(message: string) {
    super(`[InvalidContactError]: ${message}`);
  }
}
