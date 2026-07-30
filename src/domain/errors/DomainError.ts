/**
 * Abstract base class for all Domain Errors within the application.
 */
export abstract class DomainError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
