import type { ReflectionsRepository } from '@/features/reflections/domain/reflections.repository';
import { REFLECTIONS_STORAGE_KEY } from '@/features/reflections/domain/reflections.constants';
import { ANTI_MODE_STORAGE_KEY } from '@/features/anti-mode/infrastructure/anti-mode-storage.constants';

export class ChromeReflectionsRepository implements ReflectionsRepository {
  async getEnabled(): Promise<boolean> {
    const data = await chrome.storage.local.get([
      REFLECTIONS_STORAGE_KEY,
      ANTI_MODE_STORAGE_KEY,
    ]);
    const enabled: unknown = data[REFLECTIONS_STORAGE_KEY];
    if (typeof enabled === 'boolean') return enabled;
    // Preserve opt-ins from the former per-mode preference until explicitly changed.
    const legacy: unknown = data[ANTI_MODE_STORAGE_KEY];
    return (
      Array.isArray(legacy) &&
      legacy.some(
        (value: unknown) =>
          typeof value === 'object' &&
          value !== null &&
          'philosophicalKnowledge' in value &&
          value.philosophicalKnowledge === true,
      )
    );
  }

  async setEnabled(enabled: boolean): Promise<void> {
    await chrome.storage.local.set({ [REFLECTIONS_STORAGE_KEY]: enabled });
  }
}
