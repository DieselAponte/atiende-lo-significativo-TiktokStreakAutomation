import { MessageId } from '#domain/value-objects/MessageId.js';
import { ConversationId } from '#domain/value-objects/ConversationId.js';
import { MessageType } from '#domain/enums/MessageType.js';
import { SendStatus } from '#domain/enums/SendStatus.js';
import { InvalidMessageError } from '#domain/errors/InvalidMessageError.js';

export interface MessageProps {
  id: MessageId;
  conversationId: ConversationId;
  type: MessageType;
  content: string;
  status?: SendStatus;
  sentAt?: Date;
  errorMessage?: string;
  createdAt?: Date;
}

/**
 * Rich domain entity representing an automated streak message.
 */
export class Message {
  private readonly _id: MessageId;
  private readonly _conversationId: ConversationId;
  private readonly _type: MessageType;
  private readonly _content: string;
  private _status: SendStatus;
  private _sentAt: Date | undefined;
  private _errorMessage: string | undefined;
  private readonly _createdAt: Date;

  private constructor(props: MessageProps) {
    if (!props.content || props.content.trim().length === 0) {
      throw new InvalidMessageError('Message content cannot be empty.');
    }

    this._id = props.id;
    this._conversationId = props.conversationId;
    this._type = props.type;
    this._content = props.content.trim();
    this._status = props.status ?? SendStatus.PENDING;
    this._sentAt = props.sentAt ? new Date(props.sentAt) : undefined;
    this._errorMessage = props.errorMessage?.trim() || undefined;
    this._createdAt = props.createdAt ?? new Date();
  }

  /**
   * Factory method to create a Message entity.
   */
  public static create(props: MessageProps): Message {
    return new Message(props);
  }

  public get id(): MessageId {
    return this._id;
  }

  public get conversationId(): ConversationId {
    return this._conversationId;
  }

  public get type(): MessageType {
    return this._type;
  }

  public get content(): string {
    return this._content;
  }

  public get status(): SendStatus {
    return this._status;
  }

  public get sentAt(): Date | undefined {
    return this._sentAt ? new Date(this._sentAt) : undefined;
  }

  public get errorMessage(): string | undefined {
    return this._errorMessage;
  }

  public get createdAt(): Date {
    return new Date(this._createdAt);
  }

  public isPending(): boolean {
    return this._status === SendStatus.PENDING;
  }

  public isSent(): boolean {
    return this._status === SendStatus.SENT;
  }

  public isFailed(): boolean {
    return this._status === SendStatus.FAILED;
  }

  /**
   * Domain behavior: Transition status to SENT with date timestamp.
   */
  public markAsSent(sentAt: Date = new Date()): void {
    if (this._status === SendStatus.SENT) {
      throw new InvalidMessageError('Message is already marked as SENT.');
    }
    this._status = SendStatus.SENT;
    this._sentAt = new Date(sentAt);
    this._errorMessage = undefined;
  }

  /**
   * Domain behavior: Transition status to FAILED with failure reason.
   */
  public markAsFailed(reason: string): void {
    if (!reason || reason.trim().length === 0) {
      throw new InvalidMessageError('Failure reason cannot be empty.');
    }
    this._status = SendStatus.FAILED;
    this._errorMessage = reason.trim();
  }

  public equals(other: Message | null | undefined): boolean {
    if (!other) return false;
    return this._id.equals(other.id);
  }
}
