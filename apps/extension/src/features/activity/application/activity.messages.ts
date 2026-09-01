import type { ActivityService } from '../domain/activity.service';
import type { ActivityEvent } from '../domain/activity.types';
import { activityRequestSchema, type ParsedActivityRequest } from './activity.messages.schema';

export type { ActivityRequest, ParsedActivityRequest } from './activity.messages.schema';
export type ActivityResponse =
  { ok: true; events: ActivityEvent[] } | { ok: false; message: string };

export function parseActivityRequest(message: unknown): ParsedActivityRequest | undefined {
  const result = activityRequestSchema.safeParse(message);
  return result.success ? result.data : undefined;
}

export async function handleActivityRequest(
  service: ActivityService,
  request: ParsedActivityRequest,
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
