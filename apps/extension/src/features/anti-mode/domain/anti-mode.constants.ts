export const ANTI_RULE_ID_START = 2_000_000;
export const ANTI_RULE_ID_END = 2_999_999;
export const ANTI_DURATION_PRESET_DAYS = [1, 7, 31, 366, 732] as const;
export const DEFAULT_ANTI_DURATION_DAYS = 31;
export const MINIMUM_ANTI_DURATION_MS = 24 * 60 * 60 * 1000;
export const MAXIMUM_ANTI_DURATION_MS = 732 * 24 * 60 * 60 * 1000;
export const ANTI_ACCESS_MINUTES = [1, 5, 15] as const;
export const ANTI_ACCESS_ALARM_PREFIX = 'anti-mode-access:';
