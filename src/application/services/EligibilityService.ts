import { Conversation } from '#domain/entities/Conversation.js';
import type { EligibleConversationDto } from '#application/dto/EligibleConversation.dto.js';
import type { ISessionManager } from '#application/ports/ISessionManager.js';
import type { ILogger } from '#application/ports/ILogger.js';

/**
 * Application service for evaluating conversation eligibility for streak automation messages.
 */
export class EligibilityService {
  public constructor(
    private readonly sessionManager?: ISessionManager,
    private readonly logger?: ILogger,
  ) {}

  /**
   * Checks if a conversation is eligible to receive an automated streak message today.
   */
  public isEligible(conversation: Conversation, referenceDate: Date = new Date()): boolean {
    const isEligibleInDomain = conversation.isEligibleForStreakMessage(referenceDate);
    if (!isEligibleInDomain) {
      this.logger?.debug(`Conversation ${conversation.id.getValue()} is not eligible based on domain rules.`, {
        streakDays: conversation.streak.days.getValue(),
        isActive: conversation.streak.isActive,
        lastMessageSentAt: conversation.lastMessageSentAt,
      });
      return false;
    }
    return true;
  }

  /**
   * Validates if the current automation session is active.
   */
  public async isSessionValid(): Promise<boolean> {
    if (!this.sessionManager) return true;
    return this.sessionManager.validateSession();
  }

  /**
   * Maps an eligible conversation entity to an EligibleConversationDto.
   */
  public toDto(conversation: Conversation): EligibleConversationDto {
    const displayName = conversation.contact.displayName;
    const lastSentAt = conversation.lastMessageSentAt;

    return {
      conversationId: conversation.id.getValue(),
      contactId: conversation.contact.id.getValue(),
      contactUsername: conversation.contact.username,
      ...(displayName !== undefined ? { contactDisplayName: displayName } : {}),
      streakDays: conversation.streak.days.getValue(),
      ...(lastSentAt !== undefined ? { lastMessageSentAt: lastSentAt } : {}),
    };
  }
}
