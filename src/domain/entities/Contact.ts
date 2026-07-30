import { ContactId } from '#domain/value-objects/ContactId.js';
import { InvalidContactError } from '#domain/errors/InvalidContactError.js';

export interface ContactProps {
  id: ContactId;
  username: string;
  displayName?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Rich domain entity representing a Contact (TikTok user).
 */
export class Contact {
  private readonly _id: ContactId;
  private _username: string;
  private _displayName: string | undefined;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: ContactProps) {
    if (!props.username || props.username.trim().length === 0) {
      throw new InvalidContactError('Username cannot be empty.');
    }

    this._id = props.id;
    this._username = props.username.trim();
    this._displayName = props.displayName?.trim() || undefined;
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  /**
   * Factory method to instantiate a Contact entity.
   */
  public static create(props: ContactProps): Contact {
    return new Contact(props);
  }

  public get id(): ContactId {
    return this._id;
  }

  public get username(): string {
    return this._username;
  }

  public get displayName(): string | undefined {
    return this._displayName;
  }

  public get createdAt(): Date {
    return new Date(this._createdAt);
  }

  public get updatedAt(): Date {
    return new Date(this._updatedAt);
  }

  /**
   * Domain behavior: Updates the display name of the contact.
   */
  public updateDisplayName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new InvalidContactError('Display name cannot be empty.');
    }
    this._displayName = name.trim();
    this._updatedAt = new Date();
  }

  public equals(other: Contact | null | undefined): boolean {
    if (!other) return false;
    return this._id.equals(other.id);
  }
}
