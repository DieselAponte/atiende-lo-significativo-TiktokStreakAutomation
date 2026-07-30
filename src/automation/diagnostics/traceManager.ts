import fs from 'node:fs';
import path from 'node:path';
import type { BrowserContext } from 'playwright';

/**
 * Manages Playwright browser tracing recording during development or debug runs.
 */
export class TraceManager {
  private isTracingActive = false;

  /**
   * Evaluates if Playwright tracing is enabled based on environment flags.
   */
  public shouldRecordTrace(): boolean {
    return process.env.PLAYWRIGHT_TRACE === 'true' || process.env.NODE_ENV === 'development';
  }

  /**
   * Starts tracing recording on a BrowserContext if enabled.
   */
  public async start(context: BrowserContext): Promise<void> {
    if (!this.shouldRecordTrace()) {
      return;
    }

    try {
      await context.tracing.start({
        screenshots: true,
        snapshots: true,
        sources: true,
      });
      this.isTracingActive = true;
    } catch {
      this.isTracingActive = false;
    }
  }

  /**
   * Stops tracing recording and exports the zip archive to disk.
   */
  public async stop(context: BrowserContext, tracePath?: string): Promise<string | null> {
    if (!this.isTracingActive) {
      return null;
    }

    try {
      const tracesDir = path.resolve(process.cwd(), 'traces');
      if (!fs.existsSync(tracesDir)) {
        fs.mkdirSync(tracesDir, { recursive: true });
      }

      const defaultFileName = `trace_${Date.now()}.zip`;
      const outputPath = tracePath ?? path.join(tracesDir, defaultFileName);

      await context.tracing.stop({ path: outputPath });
      this.isTracingActive = false;
      return outputPath;
    } catch {
      this.isTracingActive = false;
      return null;
    }
  }

  /**
   * Resets tracing active state.
   */
  public cleanup(): void {
    this.isTracingActive = false;
  }
}
