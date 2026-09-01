import { z } from 'zod';
import { MAXIMUM_COOLDOWN_MS, MINIMUM_COOLDOWN_MS } from './standard-block.constants';

export const cooldownMillisecondsSchema = z
  .number()
  .finite()
  .min(MINIMUM_COOLDOWN_MS)
  .max(MAXIMUM_COOLDOWN_MS);

export const standardBlockSettingsSchema = z.object({
  globalCooldownMilliseconds: cooldownMillisecondsSchema,
});
