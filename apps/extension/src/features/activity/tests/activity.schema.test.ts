import { describe, expect, it } from 'vitest';
import { activityEventSchema } from '../domain/activity.schema';

describe('activity schema', () => {
  it('applies the legacy default path and normalizes stored values', () => {
    expect(
      activityEventSchema.parse({
        id: 'event-1',
        source: 'standard',
        kind: 'attempt',
        hostname: 'www.youtube.com',
        at: 1,
      }),
    ).toEqual({
      id: 'event-1',
      source: 'standard',
      kind: 'attempt',
      hostname: 'youtube.com',
      path: '/',
      at: 1,
    });
  });
});
