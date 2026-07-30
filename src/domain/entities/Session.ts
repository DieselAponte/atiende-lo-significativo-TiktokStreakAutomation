import { SessionId } from '#domain/value-objects/SessionId.js';
import { ConversationPlatform } from '#domain/enums/ConversationPlatform.js';
import { SessionStatus } from '#domain/enums/SessionStatus.js';
import { InvalidSessionError } from '#domain/errors/InvalidSessionError.js';

export interface SessionProps {
  id: SessionId;
  platform: ConversationPlatform;
  status?: SessionStatus;
  createdAt?: Date;
  expiresAt?: Date;
}

/**
 * Rich domain entity representing an automated browser/auth session.
 */
export class Session {
  private readonly _id: SessionId;
  private readonly _platform: ConversationPlatform;
  private _status: SessionStatus;
  private readonly _createdAt: Date;
  private _expiresAt: Date | undefined;

  private constructor(props: SessionProps) {
    this._id = props.id;
    this._platform = props.platform;
    this._status = props.status ?? SessionStatus.ACTIVE;
    this._createdAt = props.createdAt ?? new Date();
    this._expiresAt = props.expiresAt ? new Date(props.expiresAt) : undefined;
  }

  /**
   * Factory method to create a Session entity.
   */
  public static create(props: SessionProps): Session {
    return new Session(props);
  }

  public get id(): SessionId {
    return this._id;
  }

  public get platform(): ConversationPlatform {
    return this._platform;
  }

  public get status(): SessionStatus {
    return this._status;
  }

  public get createdAt(): Date {
    return new Date(this._createdAt);
  }

  public get expiresAt(): Date | undefined {
    return this._expiresAt ? new Date(this._expiresAt) : undefined;
  }

  /**
   * Checks if the session is active and not expired.
   */
  public isActive(now: Date = new Date()): boolean {
    if (this._status !== SessionStatus.ACTIVE) return false;
    if (this._expiresAt && now.getTime() >= this._expiresAt.getTime()) return false;
    return true;
  }

  /**
   * Checks if the session is expired.
   */
  public isExpired(now: Date = new Date()): boolean {
    if (this._status === SessionStatus.EXPIRED) return true;
    if (this._expiresAt && now.getTime() >= this._expiresAt.getTime()) return true;
    return false;
  }

  /**
   * Domain behavior: Invalidates the current session.
   */
  public invalidate(): void {
    if (this._status === SessionStatus.INVALID) {
      throw new InvalidSessionError('Session is already invalid.');
    }
    this._status = SessionStatus.INVALID;
  }

  public equals(other: Session | null | undefined): boolean {
    if (!other) return false;
    return this._id.equals(other.id);
  }
}
