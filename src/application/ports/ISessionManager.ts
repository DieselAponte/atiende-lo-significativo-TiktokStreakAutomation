import { Session } from '#domain/entities/Session.js';

/**
 * Port interface contract for automation session administration and validation.
 */
export interface ISessionManager {
  /**
   * Gets the active session or null if no session exists.
   */
  getSession(): Promise<Session | null>;

  /**
   * Validates if the active session is valid and usable for automation.
   */
  validateSession(): Promise<boolean>;

  /**
   * Renews or re-initializes the session.
   */
  renewSession(): Promise<Session>;
}
