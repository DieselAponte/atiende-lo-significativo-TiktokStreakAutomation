import { MessageType } from '#domain/enums/MessageType.js';

/**
 * Strategy interface for selecting a message category.
 */
export interface IMessageSelectionStrategy {
  selectType(): MessageType;
}

/**
 * Application strategy that randomly selects among Curiosity, Philosophy, and Science message categories.
 */
export class RandomMessageStrategy implements IMessageSelectionStrategy {
  private readonly types: MessageType[] = [
    MessageType.CURIOSITY,
    MessageType.PHILOSOPHY,
    MessageType.SCIENCE,
  ];

  public selectType(): MessageType {
    const randomIndex = Math.floor(Math.random() * this.types.length);
    return this.types[randomIndex] ?? MessageType.CURIOSITY;
  }
}
