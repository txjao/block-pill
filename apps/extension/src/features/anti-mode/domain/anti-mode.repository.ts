import type { AntiModeConfig } from './anti-mode.types';

export interface AntiModeRepository {
  getAll(): Promise<AntiModeConfig[]>;
  setAll(configs: AntiModeConfig[]): Promise<void>;
}
