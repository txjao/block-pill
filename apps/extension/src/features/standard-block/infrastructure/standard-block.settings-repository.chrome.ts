import { DEFAULT_COOLDOWN_MS } from '@/features/standard-block/domain/standard-block.constants';
import { standardBlockSettingsSchema } from '@/features/standard-block/domain/standard-block.settings.schema';
import type { StandardBlockSettingsRepository } from '@/features/standard-block/domain/standard-block.settings-repository';
import type { StandardBlockSettings } from '@/features/standard-block/domain/standard-block.types';

const STORAGE_KEY = 'standardBlockSettings';
export class ChromeStandardBlockSettingsRepository implements StandardBlockSettingsRepository {
  async get(): Promise<StandardBlockSettings> {
    const stored = await chrome.storage.local.get(STORAGE_KEY);
    const result = standardBlockSettingsSchema.safeParse(stored[STORAGE_KEY]);
    return result.success
      ? result.data
      : { globalCooldownMilliseconds: DEFAULT_COOLDOWN_MS };
  }

  async set(settings: StandardBlockSettings): Promise<void> {
    const result = standardBlockSettingsSchema.safeParse(settings);
    if (!result.success) {
      throw new Error('Não foi possível salvar um cooldown inválido.');
    }
    await chrome.storage.local.set({ [STORAGE_KEY]: result.data });
  }
}
