import { env } from '#config/env.js';

export interface ProviderConfig {
  readonly apiNinjasKey?: string;
  readonly nasaApiKey: string;
  readonly openAlexEmail?: string;
}

export const providerConfig: ProviderConfig = {
  ...(env.API_NINJAS_KEY !== undefined ? { apiNinjasKey: env.API_NINJAS_KEY } : {}),
  nasaApiKey: env.NASA_API_KEY,
  ...(env.OPENALEX_EMAIL !== undefined ? { openAlexEmail: env.OPENALEX_EMAIL } : {}),
};
