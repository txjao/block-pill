import { describe, expect, it } from 'vitest';
import { parseActivityRequest } from '../application/activity.messages';

describe('activity messages', () => {
  it('normalizes semantic values before delivering a record request', () => {
    expect(
      parseActivityRequest({
        type: 'activity/record',
        source: 'standard',
        kind: 'reflection',
        hostname: 'https://www.youtube.com/watch?v=1',
        feelings: ['  focado  '],
      }),
    ).toEqual({
      type: 'activity/record',
      source: 'standard',
      kind: 'reflection',
      hostname: 'youtube.com',
      path: '/',
      feelings: ['focado'],
    });
  });

  it('rejects records that violate activity limits', () => {
    expect(
      parseActivityRequest({
        type: 'activity/record',
        source: 'standard',
        kind: 'reflection',
        hostname: 'youtube.com',
        reason: 'a'.repeat(4_001),
      }),
    ).toBeUndefined();
  });
});
