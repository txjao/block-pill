import { z } from 'zod';
import { hostnameSchema } from '../../../shared/site/hostname.schema';

export const activityEventSchema = z.object({
  id: z.string().min(1),
  source: z.enum(['standard', 'permanent', 'anti-porn', 'anti-bet']),
  kind: z.enum(['created', 'attempt', 'access-granted', 'reflection']),
  hostname: hostnameSchema,
  path: z.string().max(2048).default('/'),
  at: z.number().finite().nonnegative(),
  durationMinutes: z.union([z.literal(1), z.literal(5), z.literal(15)]).optional(),
  feelings: z.array(z.string().trim().min(1).max(80)).max(12).optional(),
  reason: z.string().trim().max(4000).optional(),
});
