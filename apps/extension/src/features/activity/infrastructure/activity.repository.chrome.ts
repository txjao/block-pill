import { activityEventSchema } from '../domain/activity.schema';
import type { ActivityRepository } from '../domain/activity.repository';
import type { ActivityEvent } from '../domain/activity.types';

const STORAGE_KEY = 'activityEvents';

export class ChromeActivityRepository implements ActivityRepository {
  async getAll(): Promise<ActivityEvent[]> {
    const stored = await chrome.storage.local.get(STORAGE_KEY);
    const value: unknown = stored[STORAGE_KEY];
    if (!Array.isArray(value)) return [];
    return value.flatMap((candidate) => {
      const result = activityEventSchema.safeParse(candidate);
      return result.success ? [result.data] : [];
    });
  }

  async setAll(events: ActivityEvent[]): Promise<void> {
    await chrome.storage.local.set({ [STORAGE_KEY]: events });
  }
}
