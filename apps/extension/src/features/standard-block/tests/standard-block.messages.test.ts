import { describe, expect, it } from 'vitest';
import { parseStandardBlockRequest } from '../application/standard-block.messages';

describe('standard block messages', () => {
  it('accepts the blocked-tab context request', () => {
    expect(parseStandardBlockRequest({ type: 'standard-blocking/context' })).toEqual({
      type: 'standard-blocking/context',
    });
  });
});
