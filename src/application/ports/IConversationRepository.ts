import { Conversation } from '#domain/entities/Conversation.js';
import { ConversationId } from '#domain/value-objects/ConversationId.js';

/**
 * Port interface contract for Conversation aggregate root persistence.
 */
export interface IConversationRepository {
  /**
   * Persists a new or updated Conversation aggregate.
   */
  save(conversation: Conversation): Promise<void>;

  /**
   * Retrieves a conversation by its unique identifier.
   */
  findById(id: ConversationId): Promise<Conversation | null>;

  /**
   * Retrieves all persisted conversations.
   */
  findAll(): Promise<Conversation[]>;

  /**
   * Retrieves all conversations currently eligible for streak message automation.
   */
  findEligibleStreakConversations(): Promise<Conversation[]>;

  /**
   * Updates an existing Conversation aggregate.
   */
  update(conversation: Conversation): Promise<void>;
}
