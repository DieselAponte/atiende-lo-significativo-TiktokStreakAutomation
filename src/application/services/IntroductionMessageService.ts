import { Conversation } from '#domain/entities/Conversation.js';

export interface IntroductionMessageOptions {
  githubUrl?: string;
}

/**
 * Application service responsible for constructing the initial project introduction message.
 */
export class IntroductionMessageService {
  private readonly defaultGithubUrl = 'https://github.com/DieselAponte/atiende-lo-significativo-TiktokStreakAutomation';

  /**
   * Constructs the introductory message content for a contact.
   */
  public buildIntroductionContent(conversation: Conversation, options?: IntroductionMessageOptions): string {
    const githubUrl = options?.githubUrl ?? this.defaultGithubUrl;
    const recipient = conversation.contact.displayName || conversation.contact.username;

    return (
      `¡Hola ${recipient}! 👋\n` +
      `Este es un mensaje automático de "Atiende lo Significativo".\n` +
      `El objetivo de este proyecto es mantener activa nuestra racha enviándote un único mensaje diario con frases filosóficas, avances científicos o datos curiosos.\n\n` +
      `Puedes conocer más del proyecto y revisar su código abierto en GitHub:\n` +
      `${githubUrl}`
    );
  }
}
