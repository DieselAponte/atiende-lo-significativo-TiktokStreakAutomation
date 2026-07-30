/**
 * Concurrency execution lock interface preventing duplicated job runs across process restarts or multiple instances.
 */
export interface ISchedulerLock {
  acquire(): Promise<boolean>;
  release(): Promise<void>;
  isLocked(): Promise<boolean>;
}

/**
 * In-memory process execution lock adapter.
 */
export class InMemorySchedulerLock implements ISchedulerLock {
  private locked = false;

  public async acquire(): Promise<boolean> {
    if (this.locked) {
      return false;
    }
    this.locked = true;
    return true;
  }

  public async release(): Promise<void> {
    this.locked = false;
  }

  public async isLocked(): Promise<boolean> {
    return this.locked;
  }
}
