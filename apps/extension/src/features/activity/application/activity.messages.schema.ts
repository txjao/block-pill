import { z } from 'zod';
import { hostnameSchema } from '../../../shared/site/hostname.schema';
import {
  activityDurationMinutesSchema,
  activityFeelingSchema,
  activityKindSchema,
  activityPathSchema,
  activityReasonSchema,
  activitySourceSchema,
} from '../domain/activity.schema';

export const activityRequestSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('activity/list') }),
  z.object({
    type: z.literal('activity/record'),
    source: activitySourceSchema,
    kind: activityKindSchema,
    hostname: hostnameSchema,
    path: activityPathSchema.default('/'),
    durationMinutes: activityDurationMinutesSchema.optional(),
    feelings: z.array(activityFeelingSchema).max(12).optional(),
    reason: activityReasonSchema.optional(),
  }),
  z.object({
    type: z.literal('activity/remove'),
    source: activitySourceSchema.optional(),
    hostname: hostnameSchema.optional(),
  }),
]);

export type ActivityRequest = z.input<typeof activityRequestSchema>;
export type ParsedActivityRequest = z.output<typeof activityRequestSchema>;
