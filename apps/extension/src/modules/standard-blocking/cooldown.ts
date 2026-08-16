export const COOLDOWN_HOURS = [1, 2, 3, 5, 12, 24] as const;

export type CooldownHours = (typeof COOLDOWN_HOURS)[number];
