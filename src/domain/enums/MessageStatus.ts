/**
 * Represents the sending lifecycle status of a message.
 */
export enum MessageStatus {
    PENDING = 'PENDING',
    SENT = 'SENT',
    FAILED = 'FAILED',
    CANCELLED = 'CANCELLED',
}
