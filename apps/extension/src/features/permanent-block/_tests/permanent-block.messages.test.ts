import { describe, expect, it } from 'vitest';
import { parsePermanentBlockRequest } from '@/features/permanent-block/application/permanent-block.messages';
import { PERMANENT_BLOCK_MESSAGE_TYPE } from '@/features/permanent-block/application/permanent-block.messages.constants';

describe('permanent block messages', () => {
  it('normalizes the hostname at the application boundary', () => {
    expect(
      parsePermanentBlockRequest({
        type: PERMANENT_BLOCK_MESSAGE_TYPE.add,
        hostname: 'https://www.youtube.com/watch?v=1',
      }),
    ).toEqual({
      type: PERMANENT_BLOCK_MESSAGE_TYPE.add,
      hostname: 'youtube.com',
    });
  });

  it('rejects an invalid hostname', () => {
    expect(
      parsePermanentBlockRequest({
        type: PERMANENT_BLOCK_MESSAGE_TYPE.add,
        hostname: 'localhost',
      }),
    ).toBeUndefined();
  });
});
