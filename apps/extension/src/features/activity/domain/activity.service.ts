import type { Clock } from '@/shared/current-time/domain';
import type { ActivityRepository } from './activity.repository';
import type {
  ActivityEvent,
  ActivityEventInput,
  ActivitySource,
} from './activity.types';

const MAX_EVENTS = 5_000;

export class ActivityService {
  private mutation: Promise<void> = Promise.resolve();

  constructor(
    private readonly repository: ActivityRepository,
    private readonly clock: Clock,
    private readonly createId: () => string,
  ) {}

  async list(): Promise<ActivityEvent[]> {
    await this.mutation;
    return this.repository.getAll();
  }

  record(input: ActivityEventInput): Promise<ActivityEvent> {
    return this.enqueue(async () => {
      const event: ActivityEvent = {
        ...input,
        path: sanitizePath(input.path),
        id: this.createId(),
        at: this.clock.now(),
      };
      const current = await this.repository.getAll();
      await this.repository.setAll([...current, event].slice(-MAX_EVENTS));
      return event;
    });
  }

  remove(source?: ActivitySource, hostname?: string): Promise<void> {
    return this.enqueue(async () => {
      const current = await this.repository.getAll();
      const updated = current.filter((event) => {
        if (source !== undefined && event.source !== source) return true;
        if (hostname !== undefined && event.hostname !== hostname) return true;
        return false;
      });
      await this.repository.setAll(updated);
    });
  }

  private enqueue<T>(operation: () => Promise<T>): Promise<T> {
    const result = this.mutation.then(operation);
    this.mutation = result.then(
      () => undefined,
      () => undefined,
    );
    return result;
  }
}

function sanitizePath(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return normalized.split('?')[0]?.split('#')[0]?.slice(0, 2048) ?? '/';
}
