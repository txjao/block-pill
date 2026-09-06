import { z } from 'zod';
import { hostnameSchema } from '@/shared/web-address/domain';
import {
  activityDurationMinutesSchema,
  activityFeelingSchema,
  activityKindSchema,
  activityPathSchema,
  activityReasonSchema,
  activitySourceSchema,
} from '@/features/activity/domain/activity.schema';
import { ACTIVITY_MESSAGE_TYPE } from './activity.messages.constants';

export const activityRequestSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal(ACTIVITY_MESSAGE_TYPE.list) }),
  z.object({
    type: z.literal(ACTIVITY_MESSAGE_TYPE.record),
    source: activitySourceSchema,
    kind: activityKindSchema,
    hostname: hostnameSchema,
    path: activityPathSchema.default('/'),
    durationMinutes: activityDurationMinutesSchema.optional(),
    feelings: z.array(activityFeelingSchema).max(12).optional(),
    reason: activityReasonSchema.optional(),
  }),
  z.object({
    type: z.literal(ACTIVITY_MESSAGE_TYPE.remove),
    source: activitySourceSchema.optional(),
    hostname: hostnameSchema.optional(),
  }),
]);

export type ActivityRequest = z.input<typeof activityRequestSchema>;
export type ParsedActivityRequest = z.output<typeof activityRequestSchema>;
