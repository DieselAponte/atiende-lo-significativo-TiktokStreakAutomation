import { Conversation } from '#domain/entities/Conversation.js';
import { ConversationId } from '#domain/value-objects/ConversationId.js';

/**
 * Port interface for reading active conversations and their streak statuses from the automation source.
 */
export interface IConversationReader {
  /**
   * Reads all conversations available on the platform.
   */
  readAllConversations(): Promise<Conversation[]>;

  /**
   * Reads conversations that currently maintain an active streak.
   */
  readStreakConversations(): Promise<Conversation[]>;

  /**
   * Obtains a conversation by its unique identifier.
   */
  getConversationById(id: ConversationId): Promise<Conversation | null>;
}
