import { describe, expect, it } from 'vitest';
import { parsePermanentBlockRequest } from '@/features/permanent-block/application/permanent-block.messages';

describe('permanent block messages', () => {
  it('normalizes the hostname at the application boundary', () => {
    expect(
      parsePermanentBlockRequest({
        type: 'permanent-block/add',
        hostname: 'https://www.youtube.com/watch?v=1',
      }),
    ).toEqual({ type: 'permanent-block/add', hostname: 'youtube.com' });
  });

  it('rejects an invalid hostname', () => {
    expect(
      parsePermanentBlockRequest({ type: 'permanent-block/add', hostname: 'localhost' }),
    ).toBeUndefined();
  });
});
