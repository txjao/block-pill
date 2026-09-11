import { z } from 'zod';
import { hostnameSchema } from '@/shared/web-address/domain';

export const antiModeIdSchema = z.enum(['anti-porn', 'anti-bet']);
export const antiDurationUnitSchema = z.enum(['days', 'months', 'years']);
export const antiAccessMinutesSchema = z.union([
  z.literal(1),
  z.literal(5),
  z.literal(15),
]);
export const antiGoalSchema = z.string().trim().min(1).max(240);
export const antiHobbySchema = z.string().trim().min(1).max(160);

export const activateAntiModeInputSchema = z.object({
  mode: antiModeIdSchema,
  permanent: z.boolean(),
  durationValue: z.number().finite().positive().optional(),
  durationUnit: antiDurationUnitSchema.optional(),
  goals: z.array(antiGoalSchema).max(40),
  hobbies: z.array(antiHobbySchema).max(40),
  philosophicalKnowledge: z.boolean(),
  importFrom: antiModeIdSchema.optional(),
});

export const antiModeConfigSchema = z.object({
  id: antiModeIdSchema,
  enabled: z.boolean().default(false),
  permanent: z.boolean().default(false),
  createdAt: z.number().finite().nonnegative().optional(),
  commitmentEndsAt: z.number().finite().nonnegative().optional(),
  goals: z.array(antiGoalSchema).max(40).default([]),
  hobbies: z.array(antiHobbySchema).max(40).default([]),
  philosophicalKnowledge: z.boolean().default(false),
  domains: z.array(hostnameSchema).max(5_000).default([]),
  warningDomains: z.array(hostnameSchema).max(1_000).default([]),
  accessUntilByHostname: z
    .record(z.string(), z.number().finite().nonnegative())
    .default({}),
});
