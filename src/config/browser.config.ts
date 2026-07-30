import { env } from '#config/env.js';

export interface BrowserConfig {
  readonly headless: boolean;
  readonly slowMo: number;
  readonly viewport: { readonly width: number; readonly height: number };
}

export const browserConfig: BrowserConfig = {
  headless: env.HEADLESS,
  slowMo: 50,
  viewport: { width: 1280, height: 720 },
};
