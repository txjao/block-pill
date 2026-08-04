export const TEMPORARY_UNLOCK_MINUTES = [1, 5, 15] as const;

export type TemporaryUnlockMinutes =
  (typeof TEMPORARY_UNLOCK_MINUTES)[number];
