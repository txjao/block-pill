import type { ActivityEvent } from './activity.types';

export interface ActivityRepository {
  getAll(): Promise<ActivityEvent[]>;
  setAll(events: ActivityEvent[]): Promise<void>;
}
