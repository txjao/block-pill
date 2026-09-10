import { afterEach, describe, expect, it, vi } from 'vitest';
import { ChromeReflectionsRepository } from '@/features/reflections/infrastructure/reflections.repository.chrome';
import { REFLECTIONS_STORAGE_KEY } from '@/features/reflections/domain/reflections.constants';
import { ANTI_MODE_STORAGE_KEY } from '@/features/anti-mode/infrastructure/anti-mode-storage.constants';

afterEach(() => vi.unstubAllGlobals());

function setup(data: Record<string, unknown>) {
  const set = vi.fn().mockResolvedValue(undefined);
  vi.stubGlobal('chrome', {
    storage: { local: { get: vi.fn().mockResolvedValue(data), set } },
  });
  return { repository: new ChromeReflectionsRepository(), set };
}

describe('global reflections preference', () => {
  it('preserves a previous per-mode opt-in before a global choice exists', async () => {
    const { repository } = setup({
      [ANTI_MODE_STORAGE_KEY]: [{ philosophicalKnowledge: true }],
    });
    expect(await repository.getEnabled()).toBe(true);
  });
  it('respects global opt-out even when a previous mode opted in', async () => {
    const { repository } = setup({
      [REFLECTIONS_STORAGE_KEY]: false,
      [ANTI_MODE_STORAGE_KEY]: [{ philosophicalKnowledge: true }],
    });
    expect(await repository.getEnabled()).toBe(false);
  });
  it('defaults to disabled for missing or malformed data', async () => {
    const { repository } = setup({
      [ANTI_MODE_STORAGE_KEY]: [null, {}, 'invalid'],
    });
    expect(await repository.getEnabled()).toBe(false);
  });
  it('writes only the global preference', async () => {
    const { repository, set } = setup({});
    await repository.setEnabled(true);
    expect(set).toHaveBeenCalledWith({ [REFLECTIONS_STORAGE_KEY]: true });
  });
});
