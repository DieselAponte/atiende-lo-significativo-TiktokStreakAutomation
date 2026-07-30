import { MessageType } from '#domain/enums/MessageType.js';
import { type IMessageSelectionStrategy, RandomMessageStrategy } from '#application/services/RandomMessageStrategy.js';

/**
 * Application service responsible for selecting which category of message will be sent.
 */
export class MessageSelectionService {
  private readonly strategy: IMessageSelectionStrategy;

  public constructor(strategy?: IMessageSelectionStrategy) {
    this.strategy = strategy ?? new RandomMessageStrategy();
  }

  /**
   * Selects the message category to send (Curiosity, Philosophy, or Science).
   */
  public selectMessageType(): MessageType {
    return this.strategy.selectType();
  }
}
