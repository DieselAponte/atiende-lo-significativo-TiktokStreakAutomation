import { DomainError } from '#domain/errors/DomainError.js';

/**
 * Thrown when streak day count or interaction rules are violated.
 */
export class InvalidStreakError extends DomainError {
  public constructor(message: string) {
    super(`[InvalidStreakError]: ${message}`);
  }
}
