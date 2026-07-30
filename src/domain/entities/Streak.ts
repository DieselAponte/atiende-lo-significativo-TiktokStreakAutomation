import { StreakDays } from '#domain/value-objects/StreakDays.js';
import { InvalidStreakError } from '#domain/errors/InvalidStreakError.js';

export interface StreakProps {
  days: StreakDays;
  lastInteractionAt: Date;
  isActive?: boolean;
}

/**
 * Rich domain entity encapsulating TikTok streak state and logic.
 */
export class Streak {
  private _days: StreakDays;
  private _lastInteractionAt: Date;
  private _isActive: boolean;

  private constructor(props: StreakProps) {
    if (isNaN(props.lastInteractionAt.getTime())) {
      throw new InvalidStreakError('Invalid lastInteractionAt date.');
    }

    this._days = props.days;
    this._lastInteractionAt = new Date(props.lastInteractionAt);
    this._isActive = props.isActive ?? props.days.hasStreak();
  }

  /**
   * Factory method to create a Streak entity.
   */
  public static create(props: StreakProps): Streak {
    return new Streak(props);
  }

  /**
   * Factory method to initialize a brand new inactive Streak.
   */
  public static init(): Streak {
    return new Streak({
      days: StreakDays.zero(),
      lastInteractionAt: new Date(),
      isActive: false,
    });
  }

  public get days(): StreakDays {
    return this._days;
  }

  public get lastInteractionAt(): Date {
    return new Date(this._lastInteractionAt);
  }

  public get isActive(): boolean {
    return this._isActive;
  }

  /**
   * Domain behavior: Increments the streak days count by 1 and updates the interaction date.
   */
  public increment(interactionAt: Date = new Date()): void {
    if (isNaN(interactionAt.getTime())) {
      throw new InvalidStreakError('Invalid interaction date.');
    }
    this._days = this._days.increment();
    this._lastInteractionAt = new Date(interactionAt);
    this._isActive = true;
  }

  /**
   * Domain behavior: Resets the streak days count to 0 and deactivates the streak.
   */
  public reset(resetAt: Date = new Date()): void {
    if (isNaN(resetAt.getTime())) {
      throw new InvalidStreakError('Invalid reset date.');
    }
    this._days = StreakDays.zero();
    this._lastInteractionAt = new Date(resetAt);
    this._isActive = false;
  }

  /**
   * Domain behavior: Checks if an interaction occurred on the specified reference day.
   */
  public hasInteractionToday(referenceDate: Date = new Date()): boolean {
    return (
      this._lastInteractionAt.getUTCFullYear() === referenceDate.getUTCFullYear() &&
      this._lastInteractionAt.getUTCMonth() === referenceDate.getUTCMonth() &&
      this._lastInteractionAt.getUTCDate() === referenceDate.getUTCDate()
    );
  }

  /**
   * Core domain business rule:
   * Determines whether the streak is active and eligible for daily streak message automation.
   */
  public canReceiveStreakMessage(): boolean {
    return this._isActive && this._days.hasStreak();
  }
}
