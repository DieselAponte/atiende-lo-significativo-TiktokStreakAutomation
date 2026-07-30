import type { IConversationReader } from '#application/ports/IConversationReader.js';
import { EligibilityService } from '#application/services/EligibilityService.js';
import type { EligibleConversationDto } from '#application/dto/EligibleConversation.dto.js';
import type { ILogger } from '#application/ports/ILogger.js';

/**
 * Use case to retrieve all conversations currently eligible to receive daily streak messages.
 */
export class GetEligibleConversationsUseCase {
  public constructor(
    private readonly conversationReader: IConversationReader,
    private readonly eligibilityService: EligibilityService,
    private readonly logger?: ILogger,
  ) {}

  public async execute(): Promise<EligibleConversationDto[]> {
    this.logger?.info('Fetching eligible conversations for streak automation.');
    const conversations = await this.conversationReader.readStreakConversations();

    const eligibleConversations = conversations.filter((conversation) =>
      this.eligibilityService.isEligible(conversation),
    );

    this.logger?.info(
      `Found ${eligibleConversations.length} eligible conversations out of ${conversations.length} total.`,
    );

    return eligibleConversations.map((conversation) =>
      this.eligibilityService.toDto(conversation),
    );
  }
}
