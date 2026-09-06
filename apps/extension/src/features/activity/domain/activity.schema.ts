import { z } from 'zod';
import { hostnameSchema } from '@/shared/web-address/domain';

export const activitySourceSchema = z.enum(['standard', 'permanent', 'anti-porn', 'anti-bet']);
export const activityKindSchema = z.enum(['created', 'attempt', 'access-granted', 'reflection']);
export const activityPathSchema = z.string().max(2048);
export const activityDurationMinutesSchema = z.union([z.literal(1), z.literal(5), z.literal(15)]);
export const activityFeelingSchema = z.string().trim().min(1).max(80);
export const activityReasonSchema = z.string().trim().max(4000);

export const activityEventSchema = z.object({
  id: z.string().min(1),
  source: activitySourceSchema,
  kind: activityKindSchema,
  hostname: hostnameSchema,
  path: activityPathSchema.default('/'),
  at: z.number().finite().nonnegative(),
  durationMinutes: activityDurationMinutesSchema.optional(),
  feelings: z.array(activityFeelingSchema).max(12).optional(),
  reason: activityReasonSchema.optional(),
});
