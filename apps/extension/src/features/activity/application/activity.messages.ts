import { z } from 'zod';
import type { ActivityService } from '../domain/activity.service';
import type { ActivityEvent } from '../domain/activity.types';

const activityRequestSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('activity/list') }),
  z.object({
    type: z.literal('activity/record'),
    source: z.enum(['standard', 'permanent', 'anti-porn', 'anti-bet']),
    kind: z.enum(['created', 'attempt', 'access-granted', 'reflection']),
    hostname: z.string(),
    path: z.string().default('/'),
    durationMinutes: z.union([z.literal(1), z.literal(5), z.literal(15)]).optional(),
    feelings: z.array(z.string()).optional(),
    reason: z.string().optional(),
  }),
  z.object({
    type: z.literal('activity/remove'),
    source: z.enum(['standard', 'permanent', 'anti-porn', 'anti-bet']).optional(),
    hostname: z.string().optional(),
  }),
]);

export type ActivityRequest = z.infer<typeof activityRequestSchema>;
export type ActivityResponse =
  { ok: true; events: ActivityEvent[] } | { ok: false; message: string };

export function parseActivityRequest(message: unknown): ActivityRequest | undefined {
  const result = activityRequestSchema.safeParse(message);
  return result.success ? result.data : undefined;
}

export async function handleActivityRequest(
  service: ActivityService,
  request: ActivityRequest,
): Promise<ActivityResponse> {
  try {
    if (request.type === 'activity/record') {
      const { type: _type, ...input } = request;
      await service.record(input);
    } else if (request.type === 'activity/remove') {
      await service.remove(request.source, request.hostname);
    }
    return { ok: true, events: await service.list() };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'Não foi possível atualizar o histórico.',
    };
  }
}
