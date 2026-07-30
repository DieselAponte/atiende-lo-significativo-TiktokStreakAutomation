import { DomainError } from '#domain/errors/DomainError.js';

/**
 * Thrown when session status or validity bounds are violated.
 */
export class InvalidSessionError extends DomainError {
  public constructor(message: string) {
    super(`[InvalidSessionError]: ${message}`);
  }
}
