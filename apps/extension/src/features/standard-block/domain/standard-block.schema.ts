import { z } from 'zod';
import { hostnameSchema } from '../../../shared/site/hostname.schema';
import {
  MAXIMUM_COOLDOWN_MS,
  MINIMUM_COOLDOWN_MS,
  STANDARD_BLOCK_RULE_ID_END,
  STANDARD_BLOCK_RULE_ID_START,
  TEMPORARY_ACCESS_BUDGET_MINUTES,
} from './standard-block.constants';

export const temporaryAccessStateSchema = z.object({
  usedMinutes: z.number().int().min(0).max(TEMPORARY_ACCESS_BUDGET_MINUTES).default(0),
  activeUntil: z.number().finite().nonnegative().optional(),
  cooldownUntil: z.number().finite().nonnegative().optional(),
});

export const standardBlockSchema = z.object({
  hostname: hostnameSchema,
  ruleId: z.number().int().min(STANDARD_BLOCK_RULE_ID_START).max(STANDARD_BLOCK_RULE_ID_END),
  createdAt: z.number().finite().nonnegative().default(0),
  allowedSubdomains: z.array(hostnameSchema).default([]),
  cooldownMilliseconds: z
    .number()
    .finite()
    .min(MINIMUM_COOLDOWN_MS)
    .max(MAXIMUM_COOLDOWN_MS)
    .optional(),
  temporaryAccess: temporaryAccessStateSchema.default({ usedMinutes: 0 }),
});
