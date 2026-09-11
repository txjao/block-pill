import { describe, expect, it } from 'vitest';
import { readPopupPreview } from '@/entrypoints/popup/popup.mock';

describe('readPopupPreview', () => {
  it.each(['outside', 'stimulating', 'paused'] as const)(
    'returns the %s preview fixture',
    (preview) => {
      expect(readPopupPreview(`?preview=${preview}`)?.kind).toBe(preview);
    },
  );

  it('ignores unknown preview values', () => {
    expect(readPopupPreview('?preview=unknown')).toBeUndefined();
  });
});
