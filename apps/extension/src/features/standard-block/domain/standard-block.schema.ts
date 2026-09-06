import { z } from 'zod';
import { hostnameSchema } from '@/shared/web-address/domain';
import {
  STANDARD_BLOCK_RULE_ID_END,
  STANDARD_BLOCK_RULE_ID_START,
  TEMPORARY_ACCESS_BUDGET_MINUTES,
} from './standard-block.constants';
import { cooldownMillisecondsSchema } from './standard-block.settings.schema';

export const temporaryAccessMinutesSchema = z.union([z.literal(1), z.literal(5), z.literal(15)]);

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
  cooldownMilliseconds: cooldownMillisecondsSchema.optional(),
  temporaryAccess: temporaryAccessStateSchema.default({ usedMinutes: 0 }),
});
