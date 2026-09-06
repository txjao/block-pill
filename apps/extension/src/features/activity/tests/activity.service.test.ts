import { describe, expect, it } from 'vitest';
import type { Clock } from '@/shared/current-time/domain';
import type { ActivityRepository } from '@/features/activity/domain/activity.repository';
import { ActivityService } from '@/features/activity/domain/activity.service';
import type { ActivityEvent } from '@/features/activity/domain/activity.types';

class Repository implements ActivityRepository {
  events: ActivityEvent[] = [];
  async getAll() {
    return structuredClone(this.events);
  }
  async setAll(events: ActivityEvent[]) {
    this.events = structuredClone(events);
  }
}

describe('activity service', () => {
  it('remove query string e fragmento do caminho armazenado', async () => {
    const repository = new Repository();
    const clock: Clock = { now: () => 10 };
    const service = new ActivityService(repository, clock, () => 'id');
    await service.record({
      source: 'anti-porn',
      kind: 'reflection',
      hostname: 'example.com',
      path: '/search?q=segredo#parte',
      reason: 'teste',
    });
    expect(repository.events[0]?.path).toBe('/search');
  });

  it('exclui registros sem remover outros domínios', async () => {
    const repository = new Repository();
    repository.events = [
      { id: '1', source: 'standard', kind: 'attempt', hostname: 'a.com', path: '/', at: 1 },
      { id: '2', source: 'standard', kind: 'attempt', hostname: 'b.com', path: '/', at: 2 },
    ];
    const service = new ActivityService(repository, { now: () => 3 }, () => '3');
    await service.remove('standard', 'a.com');
    expect(repository.events.map((event) => event.hostname)).toEqual(['b.com']);
  });

  it('permite excluir por modo e todo o histórico', async () => {
    const repository = new Repository();
    repository.events = [
      { id: '1', source: 'anti-porn', kind: 'attempt', hostname: 'a.com', path: '/', at: 1 },
      { id: '2', source: 'anti-porn', kind: 'reflection', hostname: 'b.com', path: '/', at: 2 },
      { id: '3', source: 'permanent', kind: 'attempt', hostname: 'c.com', path: '/', at: 3 },
    ];
    const service = new ActivityService(repository, { now: () => 4 }, () => '4');

    await service.remove('anti-porn');
    expect(repository.events.map((event) => event.source)).toEqual(['permanent']);

    await service.remove();
    expect(repository.events).toEqual([]);
  });
});
