import { env } from '#config/env.js';

export interface AppConfig {
  readonly env: string;
  readonly isProduction: boolean;
  readonly isDevelopment: boolean;
}

export const appConfig: AppConfig = {
  env: env.NODE_ENV,
  isProduction: env.NODE_ENV === 'production',
  isDevelopment: env.NODE_ENV === 'development',
};
