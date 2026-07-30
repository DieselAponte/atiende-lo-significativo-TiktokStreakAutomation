import { Conversation } from '#domain/entities/Conversation.js';
import { ConversationId } from '#domain/value-objects/ConversationId.js';
import { Contact } from '#domain/entities/Contact.js';
import { ContactId } from '#domain/value-objects/ContactId.js';
import { Streak } from '#domain/entities/Streak.js';
import { StreakDays } from '#domain/value-objects/StreakDays.js';
import { ConversationPlatform } from '#domain/enums/ConversationPlatform.js';
import type { ContactModel, ConversationModel } from '../generated/prisma/index.js';

export type ConversationWithContact = ConversationModel & {
  contact: ContactModel;
};

/**
 * Mapper responsible for converting between Prisma ConversationModel records and Domain Conversation entities.
 */
export class ConversationMapper {
  public static toDomain(raw: ConversationWithContact): Conversation {
    const contact = Contact.create({
      id: ContactId.create(raw.contact.id),
      username: raw.contact.username,
      ...(raw.contact.displayName !== null ? { displayName: raw.contact.displayName } : {}),
      createdAt: raw.contact.createdAt,
      updatedAt: raw.contact.updatedAt,
    });

    const streak = Streak.create({
      days: StreakDays.create(raw.streakDays),
      lastInteractionAt: raw.streakLastInteractionAt,
      isActive: raw.isStreakActive,
    });

    return Conversation.create({
      id: ConversationId.create(raw.id),
      contact,
      platform: raw.platform as ConversationPlatform,
      streak,
      ...(raw.lastMessageSentAt !== null ? { lastMessageSentAt: raw.lastMessageSentAt } : {}),
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  public static toPrisma(conversation: Conversation) {
    return {
      conversationRecord: {
        id: conversation.id.getValue(),
        contactId: conversation.contact.id.getValue(),
        platform: conversation.platform,
        streakDays: conversation.streak.days.getValue(),
        streakLastInteractionAt: conversation.streak.lastInteractionAt,
        isStreakActive: conversation.streak.isActive,
        lastMessageSentAt: conversation.lastMessageSentAt ?? null,
      },
      contactRecord: {
        id: conversation.contact.id.getValue(),
        username: conversation.contact.username,
        displayName: conversation.contact.displayName ?? null,
      },
    };
  }
}
