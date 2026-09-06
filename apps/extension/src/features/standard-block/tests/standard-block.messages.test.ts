import { describe, expect, it } from 'vitest';
import { parseStandardBlockRequest } from '@/features/standard-block/application/standard-block.messages';

describe('standard block messages', () => {
  it('accepts the blocked-tab context request', () => {
    expect(parseStandardBlockRequest({ type: 'standard-blocking/context' })).toEqual({
      type: 'standard-blocking/context',
    });
  });

  it('normalizes hostnames before delivering the request', () => {
    expect(
      parseStandardBlockRequest({
        type: 'standard-blocking/add',
        hostname: 'https://www.youtube.com/watch?v=1',
      }),
    ).toEqual({ type: 'standard-blocking/add', hostname: 'youtube.com' });
  });

  it('rejects a global cooldown outside the domain limits', () => {
    expect(
      parseStandardBlockRequest({
        type: 'standard-blocking/update-settings',
        globalCooldownMilliseconds: 1,
      }),
    ).toBeUndefined();
  });
});
