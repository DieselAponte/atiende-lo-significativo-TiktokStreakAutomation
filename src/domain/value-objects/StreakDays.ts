import { InvalidStreakError } from '#domain/errors/InvalidStreakError.js';

/**
 * Value Object representing the count of active consecutive streak days.
 */
export class StreakDays {
  private readonly count: number;

  private constructor(count: number) {
    if (!Number.isInteger(count) || count < 0) {
      throw new InvalidStreakError(`Streak days must be a non-negative integer. Received: ${count}`);
    }
    this.count = count;
  }

  /**
   * Creates a StreakDays value object.
   */
  public static create(count: number): StreakDays {
    return new StreakDays(count);
  }

  /**
   * Returns a StreakDays value object with 0 days.
   */
  public static zero(): StreakDays {
    return new StreakDays(0);
  }

  public getValue(): number {
    return this.count;
  }

  /**
   * Returns a new StreakDays instance incremented by 1 day.
   */
  public increment(): StreakDays {
    return new StreakDays(this.count + 1);
  }

  /**
   * Returns a new StreakDays instance reset to 0 days.
   */
  public reset(): StreakDays {
    return StreakDays.zero();
  }

  /**
   * Checks if an active streak exists (> 0 days).
   */
  public hasStreak(): boolean {
    return this.count > 0;
  }

  /**
   * Checks if this streak days count is greater than or equal to another.
   */
  public isGreaterOrEqual(other: StreakDays): boolean {
    return this.count >= other.getValue();
  }

  public equals(other: StreakDays | null | undefined): boolean {
    if (!other) return false;
    return this.count === other.getValue();
  }

  public toString(): string {
    return this.count.toString();
  }
}
