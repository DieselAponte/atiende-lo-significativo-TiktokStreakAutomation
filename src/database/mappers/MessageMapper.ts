import { Message } from '#domain/entities/Message.js';
import { MessageId } from '#domain/value-objects/MessageId.js';
import { ConversationId } from '#domain/value-objects/ConversationId.js';
import { MessageType } from '#domain/enums/MessageType.js';
import { SendStatus } from '#domain/enums/SendStatus.js';
import type { MessageModel } from '../generated/prisma/index.js';

/**
 * Mapper responsible for converting between Prisma MessageModel records and Domain Message entities.
 */
export class MessageMapper {
  public static toDomain(raw: MessageModel): Message {
    return Message.create({
      id: MessageId.create(raw.id),
      conversationId: ConversationId.create(raw.conversationId),
      type: raw.type as MessageType,
      content: raw.content,
      status: raw.status as SendStatus,
      ...(raw.sentAt !== null ? { sentAt: raw.sentAt } : {}),
      ...(raw.errorMessage !== null ? { errorMessage: raw.errorMessage } : {}),
      createdAt: raw.createdAt,
    });
  }

  public static toPrisma(message: Message) {
    return {
      id: message.id.getValue(),
      conversationId: message.conversationId.getValue(),
      type: message.type,
      content: message.content,
      status: message.status,
      sentAt: message.sentAt ?? null,
      errorMessage: message.errorMessage ?? null,
      createdAt: message.createdAt,
    };
  }
}
