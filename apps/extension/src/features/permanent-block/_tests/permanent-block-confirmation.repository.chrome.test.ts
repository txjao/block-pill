import { afterEach, describe, expect, it, vi } from 'vitest';
import { PERMANENT_BLOCK_CONFIRMATION_STORAGE_KEY } from '@/features/permanent-block/domain/permanent-block-confirmation.constants';
import { ChromePermanentBlockConfirmationRepository } from '@/features/permanent-block/infrastructure/permanent-block-confirmation.repository.chrome';

afterEach(() => vi.unstubAllGlobals());

function setup(data: Record<string, unknown>) {
  const set = vi.fn().mockResolvedValue(undefined);
  vi.stubGlobal('chrome', {
    storage: { local: { get: vi.fn().mockResolvedValue(data), set } },
  });
  return {
    repository: new ChromePermanentBlockConfirmationRepository(),
    set,
  };
}

describe('permanent block confirmation preference', () => {
  it('defaults to enabled when the preference is missing or malformed', async () => {
    expect(await setup({}).repository.getEnabled()).toBe(true);
    expect(
      await setup({
        [PERMANENT_BLOCK_CONFIRMATION_STORAGE_KEY]: 'invalid',
      }).repository.getEnabled(),
    ).toBe(true);
  });

  it('respects a stored opt-out', async () => {
    expect(
      await setup({
        [PERMANENT_BLOCK_CONFIRMATION_STORAGE_KEY]: false,
      }).repository.getEnabled(),
    ).toBe(false);
  });

  it('writes only the confirmation preference', async () => {
    const { repository, set } = setup({});
    await repository.setEnabled(false);
    expect(set).toHaveBeenCalledWith({
      [PERMANENT_BLOCK_CONFIRMATION_STORAGE_KEY]: false,
    });
  });
});
