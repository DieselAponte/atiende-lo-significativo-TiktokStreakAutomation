import { env } from '#config/env.js';

export interface SchedulerConfig {
  readonly cronExpression: string;
  readonly enabled: boolean;
}

export const schedulerConfig: SchedulerConfig = {
  cronExpression: env.CRON_SCHEDULE,
  enabled: true,
};
