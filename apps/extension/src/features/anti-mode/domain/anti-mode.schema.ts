import { z } from 'zod';
import { hostnameSchema } from '../../../shared/site/hostname.schema';

export const antiModeIdSchema = z.enum(['anti-porn', 'anti-bet']);

export const antiModeConfigSchema = z.object({
  id: antiModeIdSchema,
  enabled: z.boolean().default(false),
  permanent: z.boolean().default(false),
  createdAt: z.number().finite().nonnegative().optional(),
  commitmentEndsAt: z.number().finite().nonnegative().optional(),
  goals: z.array(z.string().trim().min(1).max(240)).max(40).default([]),
  hobbies: z.array(z.string().trim().min(1).max(160)).max(40).default([]),
  philosophicalKnowledge: z.boolean().default(false),
  domains: z.array(hostnameSchema).max(5_000).default([]),
  warningDomains: z.array(hostnameSchema).max(1_000).default([]),
  accessUntilByHostname: z.record(z.string(), z.number().finite().nonnegative()).default({}),
});
