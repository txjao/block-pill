import type { AntiModeConfig } from './anti-mode.types';

export interface AntiModeRuleManager {
  replaceAll(configs: AntiModeConfig[], now: number): Promise<void>;
}
