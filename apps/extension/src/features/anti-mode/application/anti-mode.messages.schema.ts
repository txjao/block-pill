import { z } from 'zod';
import { hostnameSchema } from '../../../shared/site/hostname.schema';
import {
  activateAntiModeInputSchema,
  antiAccessMinutesSchema,
  antiModeIdSchema,
} from '../domain/anti-mode.schema';

export const antiModeRequestSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('anti-mode/list') }),
  z.object({ type: z.literal('anti-mode/activate') }).extend(activateAntiModeInputSchema.shape),
  z.object({ type: z.literal('anti-mode/deactivate'), mode: antiModeIdSchema }),
  z.object({
    type: z.literal('anti-mode/add-domain'),
    mode: antiModeIdSchema,
    hostname: hostnameSchema,
  }),
  z.object({
    type: z.literal('anti-mode/grant-access'),
    mode: antiModeIdSchema,
    hostname: hostnameSchema,
    minutes: antiAccessMinutesSchema,
  }),
  z.object({ type: z.literal('incognito/status') }),
  z.object({ type: z.literal('incognito/open-settings') }),
  z.object({ type: z.literal('incognito/set-control'), blocked: z.boolean() }),
  z.object({ type: z.literal('incognito/suspend'), minutes: antiAccessMinutesSchema }),
]);

export type AntiModeRequest = z.input<typeof antiModeRequestSchema>;
export type ParsedAntiModeRequest = z.output<typeof antiModeRequestSchema>;
