import { antiModeConfigSchema } from '@/features/anti-mode/domain/anti-mode.schema';
import type { AntiModeRepository } from '@/features/anti-mode/domain/anti-mode.repository';
import type { AntiModeConfig } from '@/features/anti-mode/domain/anti-mode.types';

import { ANTI_MODE_STORAGE_KEY as STORAGE_KEY } from './anti-mode-storage.constants';

export class ChromeAntiModeRepository implements AntiModeRepository {
  async getAll(): Promise<AntiModeConfig[]> {
    const stored = await chrome.storage.local.get(STORAGE_KEY);
    const value: unknown = stored[STORAGE_KEY];
    if (!Array.isArray(value)) return [];
    return value.flatMap((candidate) => {
      const result = antiModeConfigSchema.safeParse(candidate);
      return result.success ? [result.data] : [];
    });
  }

  async setAll(configs: AntiModeConfig[]): Promise<void> {
    const result = antiModeConfigSchema.array().safeParse(configs);
    if (!result.success) {
      throw new Error(
        'Não foi possível salvar uma configuração de modo anti inválida.',
      );
    }
    await chrome.storage.local.set({ [STORAGE_KEY]: result.data });
  }
}
