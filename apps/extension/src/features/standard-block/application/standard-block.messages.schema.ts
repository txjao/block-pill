import { z } from 'zod';
import { hostnameSchema } from '../../../shared/site/hostname.schema';
import { temporaryAccessMinutesSchema } from '../domain/standard-block.schema';
import { cooldownMillisecondsSchema } from '../domain/standard-block.settings.schema';

export const standardBlockRequestSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('standard-blocking/list') }),
  z.object({ type: z.literal('standard-blocking/add'), hostname: hostnameSchema }),
  z.object({ type: z.literal('standard-blocking/remove'), hostname: hostnameSchema }),
  z.object({ type: z.literal('standard-blocking/status'), hostname: hostnameSchema }),
  z.object({ type: z.literal('standard-blocking/context') }),
  z.object({
    type: z.literal('standard-blocking/request-access'),
    hostname: hostnameSchema,
    minutes: temporaryAccessMinutesSchema,
  }),
  z.object({ type: z.literal('standard-blocking/settings') }),
  z.object({
    type: z.literal('standard-blocking/update-settings'),
    globalCooldownMilliseconds: cooldownMillisecondsSchema,
  }),
  z.object({
    type: z.literal('standard-blocking/update-domain-cooldown'),
    hostname: hostnameSchema,
    cooldownMilliseconds: cooldownMillisecondsSchema.nullable(),
  }),
  z.object({
    type: z.literal('standard-blocking/add-subdomain-exception'),
    hostname: hostnameSchema,
    subdomain: hostnameSchema,
  }),
]);

export type StandardBlockRequest = z.input<typeof standardBlockRequestSchema>;
export type ParsedStandardBlockRequest = z.output<typeof standardBlockRequestSchema>;
