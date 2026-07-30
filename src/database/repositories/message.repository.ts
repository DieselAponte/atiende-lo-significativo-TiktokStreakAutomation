import type { IMessageRepository } from '#application/ports/IMessageRepository.js';
import { Message } from '#domain/entities/Message.js';
import { MessageId } from '#domain/value-objects/MessageId.js';
import { ConversationId } from '#domain/value-objects/ConversationId.js';
import { SendStatus } from '#domain/enums/SendStatus.js';
import { PrismaService } from '#database/client-prisma.js';
import { MessageMapper } from '#database/mappers/MessageMapper.js';
import type { ILogger } from '#application/ports/ILogger.js';

/**
 * Prisma repository adapter implementing IMessageRepository.
 */
export class PrismaMessageRepository implements IMessageRepository {
  public constructor(private readonly logger?: ILogger) {}

  private get prisma() {
    return PrismaService.getInstance(this.logger);
  }

  public async save(message: Message): Promise<void> {
    const record = MessageMapper.toPrisma(message);

    await this.prisma.messageModel.upsert({
      where: { id: record.id },
      create: record,
      update: record,
    });
  }

  public async findById(id: MessageId): Promise<Message | null> {
    const raw = await this.prisma.messageModel.findUnique({
      where: { id: id.getValue() },
    });

    if (!raw) return null;
    return MessageMapper.toDomain(raw);
  }

  public async findByConversationId(conversationId: ConversationId): Promise<Message[]> {
    const records = await this.prisma.messageModel.findMany({
      where: { conversationId: conversationId.getValue() },
      orderBy: { createdAt: 'desc' },
    });

    return records.map((record) => MessageMapper.toDomain(record));
  }

  public async hasReceivedIntroductionMessage(conversationId: ConversationId): Promise<boolean> {
    const count = await this.prisma.messageModel.count({
      where: {
        conversationId: conversationId.getValue(),
        status: SendStatus.SENT,
        content: { contains: 'Atiende lo Significativo' },
      },
    });

    return count > 0;
  }

  public async hasReceivedMessageToday(
    conversationId: ConversationId,
    referenceDate: Date = new Date(),
  ): Promise<boolean> {
    const startOfDay = new Date(
      Date.UTC(
        referenceDate.getUTCFullYear(),
        referenceDate.getUTCMonth(),
        referenceDate.getUTCDate(),
        0,
        0,
        0,
      ),
    );
    const endOfDay = new Date(
      Date.UTC(
        referenceDate.getUTCFullYear(),
        referenceDate.getUTCMonth(),
        referenceDate.getUTCDate(),
        23,
        59,
        59,
        999,
      ),
    );

    const count = await this.prisma.messageModel.count({
      where: {
        conversationId: conversationId.getValue(),
        status: SendStatus.SENT,
        sentAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    return count > 0;
  }
}
