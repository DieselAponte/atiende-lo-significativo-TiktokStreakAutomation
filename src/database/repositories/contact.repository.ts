import type { IConversationRepository } from '#application/ports/IConversationRepository.js';
import { Conversation } from '#domain/entities/Conversation.js';
import { ConversationId } from '#domain/value-objects/ConversationId.js';
import { PrismaService } from '#database/client-prisma.js';
import { ConversationMapper } from '#database/mappers/ConversationMapper.js';
import type { ILogger } from '#application/ports/ILogger.js';

/**
 * Prisma repository adapter implementing IConversationRepository.
 */
export class PrismaConversationRepository implements IConversationRepository {
  public constructor(private readonly logger?: ILogger) {}

  private get prisma() {
    return PrismaService.getInstance(this.logger);
  }

  public async save(conversation: Conversation): Promise<void> {
    const { conversationRecord, contactRecord } = ConversationMapper.toPrisma(conversation);

    await this.prisma.$transaction([
      this.prisma.contactModel.upsert({
        where: { id: contactRecord.id },
        create: contactRecord,
        update: {
          username: contactRecord.username,
          displayName: contactRecord.displayName,
        },
      }),
      this.prisma.conversationModel.upsert({
        where: { id: conversationRecord.id },
        create: conversationRecord,
        update: conversationRecord,
      }),
    ]);
  }

  public async findById(id: ConversationId): Promise<Conversation | null> {
    const raw = await this.prisma.conversationModel.findUnique({
      where: { id: id.getValue() },
      include: { contact: true },
    });

    if (!raw) return null;
    return ConversationMapper.toDomain(raw);
  }

  public async findAll(): Promise<Conversation[]> {
    const records = await this.prisma.conversationModel.findMany({
      include: { contact: true },
      orderBy: { updatedAt: 'desc' },
    });

    return records.map((record) => ConversationMapper.toDomain(record));
  }

  public async findEligibleStreakConversations(): Promise<Conversation[]> {
    const records = await this.prisma.conversationModel.findMany({
      where: {
        isStreakActive: true,
        streakDays: { gt: 0 },
      },
      include: { contact: true },
    });

    const conversations = records.map((record) => ConversationMapper.toDomain(record));
    const now = new Date();
    return conversations.filter((conv) => conv.isEligibleForStreakMessage(now));
  }

  public async update(conversation: Conversation): Promise<void> {
    const { conversationRecord, contactRecord } = ConversationMapper.toPrisma(conversation);

    await this.prisma.$transaction([
      this.prisma.contactModel.update({
        where: { id: contactRecord.id },
        data: contactRecord,
      }),
      this.prisma.conversationModel.update({
        where: { id: conversationRecord.id },
        data: conversationRecord,
      }),
    ]);
  }
}
