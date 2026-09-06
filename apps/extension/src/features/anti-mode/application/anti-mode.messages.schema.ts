import { z } from 'zod';
import { hostnameSchema } from '@/shared/web-address/domain';
import {
  activateAntiModeInputSchema,
  antiAccessMinutesSchema,
  antiModeIdSchema,
} from '@/features/anti-mode/domain/anti-mode.schema';
import {
  ANTI_MODE_MESSAGE_TYPE,
  INCOGNITO_MESSAGE_TYPE,
} from './anti-mode.messages.constants';

export const antiModeRequestSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal(ANTI_MODE_MESSAGE_TYPE.list) }),
  z
    .object({ type: z.literal(ANTI_MODE_MESSAGE_TYPE.activate) })
    .extend(activateAntiModeInputSchema.shape),
  z.object({
    type: z.literal(ANTI_MODE_MESSAGE_TYPE.deactivate),
    mode: antiModeIdSchema,
  }),
  z.object({
    type: z.literal(ANTI_MODE_MESSAGE_TYPE.addDomain),
    mode: antiModeIdSchema,
    hostname: hostnameSchema,
  }),
  z.object({
    type: z.literal(ANTI_MODE_MESSAGE_TYPE.grantAccess),
    mode: antiModeIdSchema,
    hostname: hostnameSchema,
    minutes: antiAccessMinutesSchema,
  }),
  z.object({ type: z.literal(INCOGNITO_MESSAGE_TYPE.status) }),
  z.object({ type: z.literal(INCOGNITO_MESSAGE_TYPE.openSettings) }),
  z.object({
    type: z.literal(INCOGNITO_MESSAGE_TYPE.setControl),
    blocked: z.boolean(),
  }),
  z.object({
    type: z.literal(INCOGNITO_MESSAGE_TYPE.suspend),
    minutes: antiAccessMinutesSchema,
  }),
]);

export type AntiModeRequest = z.input<typeof antiModeRequestSchema>;
export type ParsedAntiModeRequest = z.output<typeof antiModeRequestSchema>;
