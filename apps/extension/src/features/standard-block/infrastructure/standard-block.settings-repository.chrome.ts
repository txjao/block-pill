import { z } from 'zod';
import {
  DEFAULT_COOLDOWN_MS,
  MAXIMUM_COOLDOWN_MS,
  MINIMUM_COOLDOWN_MS,
} from '../domain/standard-block.constants';
import type { StandardBlockSettingsRepository } from '../domain/standard-block.settings-repository';
import type { StandardBlockSettings } from '../domain/standard-block.types';

const STORAGE_KEY = 'standardBlockSettings';
const schema = z.object({
  globalCooldownMilliseconds: z.number().finite().min(MINIMUM_COOLDOWN_MS).max(MAXIMUM_COOLDOWN_MS),
});

export class ChromeStandardBlockSettingsRepository implements StandardBlockSettingsRepository {
  async get(): Promise<StandardBlockSettings> {
    const stored = await chrome.storage.local.get(STORAGE_KEY);
    const result = schema.safeParse(stored[STORAGE_KEY]);
    return result.success ? result.data : { globalCooldownMilliseconds: DEFAULT_COOLDOWN_MS };
  }

  async set(settings: StandardBlockSettings): Promise<void> {
    await chrome.storage.local.set({ [STORAGE_KEY]: schema.parse(settings) });
  }
}
