import type { z } from 'zod';
import type {
  activityDurationMinutesSchema,
  activityKindSchema,
  activitySourceSchema,
} from './activity.schema';

export type ActivitySource = z.output<typeof activitySourceSchema>;
export type ActivityKind = z.output<typeof activityKindSchema>;
export type ActivityDurationMinutes = z.output<
  typeof activityDurationMinutesSchema
>;

export interface ActivityEvent {
  id: string;
  source: ActivitySource;
  kind: ActivityKind;
  hostname: string;
  path: string;
  at: number;
  durationMinutes?: ActivityDurationMinutes;
  feelings?: string[];
  reason?: string;
}

export type ActivityEventInput = Omit<ActivityEvent, 'id' | 'at'>;
