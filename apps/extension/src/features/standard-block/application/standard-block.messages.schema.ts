import { z } from 'zod';
import { hostnameSchema } from '@/shared/web-address/domain';
import { temporaryAccessMinutesSchema } from '@/features/standard-block/domain/standard-block.schema';
import { cooldownMillisecondsSchema } from '@/features/standard-block/domain/standard-block.settings.schema';
import { STANDARD_BLOCK_MESSAGE_TYPE } from './standard-block.messages.constants';

export const standardBlockRequestSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal(STANDARD_BLOCK_MESSAGE_TYPE.list) }),
  z.object({ type: z.literal(STANDARD_BLOCK_MESSAGE_TYPE.add), hostname: hostnameSchema }),
  z.object({ type: z.literal(STANDARD_BLOCK_MESSAGE_TYPE.remove), hostname: hostnameSchema }),
  z.object({ type: z.literal(STANDARD_BLOCK_MESSAGE_TYPE.status), hostname: hostnameSchema }),
  z.object({ type: z.literal(STANDARD_BLOCK_MESSAGE_TYPE.context) }),
  z.object({
    type: z.literal(STANDARD_BLOCK_MESSAGE_TYPE.requestAccess),
    hostname: hostnameSchema,
    minutes: temporaryAccessMinutesSchema,
  }),
  z.object({ type: z.literal(STANDARD_BLOCK_MESSAGE_TYPE.settings) }),
  z.object({
    type: z.literal(STANDARD_BLOCK_MESSAGE_TYPE.updateSettings),
    globalCooldownMilliseconds: cooldownMillisecondsSchema,
  }),
  z.object({
    type: z.literal(STANDARD_BLOCK_MESSAGE_TYPE.updateDomainCooldown),
    hostname: hostnameSchema,
    cooldownMilliseconds: cooldownMillisecondsSchema.nullable(),
  }),
  z.object({
    type: z.literal(STANDARD_BLOCK_MESSAGE_TYPE.addSubdomainException),
    hostname: hostnameSchema,
    subdomain: hostnameSchema,
  }),
]);

export type StandardBlockRequest = z.input<typeof standardBlockRequestSchema>;
export type ParsedStandardBlockRequest = z.output<typeof standardBlockRequestSchema>;
