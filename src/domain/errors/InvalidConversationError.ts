import { DomainError } from '#domain/errors/DomainError.js';

/**
 * Thrown when conversation domain constraints or invariants are violated.
 */
export class InvalidConversationError extends DomainError {
  public constructor(message: string) {
    super(`[InvalidConversationError]: ${message}`);
  }
}
