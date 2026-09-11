export const MINUTE_MS = 60 * 1000;
export const HOUR_MS = 60 * MINUTE_MS;
export const DAY_MS = 24 * HOUR_MS;

export const STANDARD_BLOCK_RULE_ID_START = 1;
export const STANDARD_BLOCK_RULE_ID_END = 999_999;

export const TEMPORARY_ACCESS_BUDGET_MINUTES = 15;
export const TEMPORARY_ACCESS_MINUTES = [1, 5, 15] as const;

export const COOLDOWN_PRESET_HOURS = [1, 2, 4, 6, 12, 24] as const;
export const DEFAULT_COOLDOWN_HOURS = 1;
export const DEFAULT_COOLDOWN_MS = DEFAULT_COOLDOWN_HOURS * HOUR_MS;
export const MINIMUM_COOLDOWN_MS = HOUR_MS;
export const MAXIMUM_COOLDOWN_MS = 732 * DAY_MS;

export const STANDARD_ACCESS_ALARM_PREFIX = 'standard-block-access:';

export function createStandardAccessAlarmName(hostname: string): string {
  return `${STANDARD_ACCESS_ALARM_PREFIX}${hostname}`;
}
