import type { ITemplateRenderer } from '#templates/interfaces/ITemplateRenderer.js';
import { CuriosityTemplate } from '#templates/curiosity/CuriosityTemplate.js';
import { PhilosophyTemplate } from '#templates/philosophy/PhilosophyTemplate.js';
import { ScienceTemplate } from '#templates/science/ScienceTemplate.js';
import { MessageType } from '#domain/enums/MessageType.js';

/**
 * Open/Closed Principle compliant registry mapping MessageTypes to ITemplateRenderer strategies.
 */
export class TemplateRegistry {
  private readonly renderers = new Map<MessageType | string, ITemplateRenderer>();
  private readonly defaultRenderer: ITemplateRenderer;

  public constructor() {
    const curiosity = new CuriosityTemplate();
    this.defaultRenderer = curiosity;

    this.register(MessageType.CURIOSITY, curiosity);
    this.register(MessageType.PHILOSOPHY, new PhilosophyTemplate());
    this.register(MessageType.SCIENCE, new ScienceTemplate());
  }

  public register(type: MessageType | string, renderer: ITemplateRenderer): void {
    this.renderers.set(type, renderer);
  }

  public getRenderer(type: MessageType | string): ITemplateRenderer {
    return this.renderers.get(type) ?? this.defaultRenderer;
  }
}
