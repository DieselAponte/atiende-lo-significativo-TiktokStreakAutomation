import { ConversationId } from '#domain/value-objects/ConversationId.js';
import { Contact } from '#domain/entities/Contact.js';
import { Streak } from '#domain/entities/Streak.js';
import { ConversationPlatform } from '#domain/enums/ConversationPlatform.js';
import { InvalidConversationError } from '#domain/errors/InvalidConversationError.js';

export interface ConversationProps {
  id: ConversationId;
  contact: Contact;
  platform: ConversationPlatform;
  streak: Streak;
  lastMessageSentAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Aggregate Root / Rich Domain Entity representing a TikTok Direct Message Conversation.
 */
export class Conversation {
  private readonly _id: ConversationId;
  private readonly _contact: Contact;
  private readonly _platform: ConversationPlatform;
  private _streak: Streak;
  private _lastMessageSentAt: Date | undefined;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: ConversationProps) {
    if (!props.contact) {
      throw new InvalidConversationError('Conversation must have a valid Contact.');
    }
    if (!props.streak) {
      throw new InvalidConversationError('Conversation must have a valid Streak.');
    }

    this._id = props.id;
    this._contact = props.contact;
    this._platform = props.platform;
    this._streak = props.streak;
    this._lastMessageSentAt = props.lastMessageSentAt ? new Date(props.lastMessageSentAt) : undefined;
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  /**
   * Factory method to instantiate a Conversation entity.
   */
  public static create(props: ConversationProps): Conversation {
    return new Conversation(props);
  }

  public get id(): ConversationId {
    return this._id;
  }

  public get contact(): Contact {
    return this._contact;
  }

  public get platform(): ConversationPlatform {
    return this._platform;
  }

  public get streak(): Streak {
    return this._streak;
  }

  public get lastMessageSentAt(): Date | undefined {
    return this._lastMessageSentAt ? new Date(this._lastMessageSentAt) : undefined;
  }

  public get createdAt(): Date {
    return new Date(this._createdAt);
  }

  public get updatedAt(): Date {
    return new Date(this._updatedAt);
  }

  /**
   * Business rule: Checks if an automated message was already sent today for this conversation.
   */
  public hasMessageBeenSentToday(referenceDate: Date = new Date()): boolean {
    if (!this._lastMessageSentAt) return false;
    return (
      this._lastMessageSentAt.getUTCFullYear() === referenceDate.getUTCFullYear() &&
      this._lastMessageSentAt.getUTCMonth() === referenceDate.getUTCMonth() &&
      this._lastMessageSentAt.getUTCDate() === referenceDate.getUTCDate()
    );
  }

  /**
   * Core domain business rule:
   * Determines if the conversation is eligible for automated streak message dispatch today.
   * Eligible ONLY IF:
   * 1. The streak is active and > 0 days.
   * 2. No automated message has been sent today.
   */
  public isEligibleForStreakMessage(referenceDate: Date = new Date()): boolean {
    return this._streak.canReceiveStreakMessage() && !this.hasMessageBeenSentToday(referenceDate);
  }

  /**
   * Domain behavior: Records that a message was successfully sent to this conversation.
   */
  public recordMessageSent(sentAt: Date = new Date()): void {
    if (!this.isEligibleForStreakMessage(sentAt)) {
      throw new InvalidConversationError(
        'Cannot record message sent: Conversation is not eligible for streak message today.',
      );
    }
    this._lastMessageSentAt = new Date(sentAt);
    this._updatedAt = new Date();
  }

  /**
   * Domain behavior: Updates the streak state for this conversation.
   */
  public updateStreak(newStreak: Streak): void {
    this._streak = newStreak;
    this._updatedAt = new Date();
  }

  public equals(other: Conversation | null | undefined): boolean {
    if (!other) return false;
    return this._id.equals(other.id);
  }
}
