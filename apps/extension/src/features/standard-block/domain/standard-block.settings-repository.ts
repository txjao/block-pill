import type { StandardBlockSettings } from './standard-block.types';

export interface StandardBlockSettingsRepository {
  get(): Promise<StandardBlockSettings>;
  set(settings: StandardBlockSettings): Promise<void>;
}
