import type { Hostname } from '@/shared/web-address/domain';
import type { TEMPORARY_ACCESS_MINUTES } from './standard-block.constants';

export type TemporaryAccessMinutes = (typeof TEMPORARY_ACCESS_MINUTES)[number];

export interface TemporaryAccessState {
  usedMinutes: number;
  activeUntil?: number;
  cooldownUntil?: number;
}

export interface StandardBlock {
  hostname: Hostname;
  ruleId: number;
  createdAt: number;
  allowedSubdomains: Hostname[];
  cooldownMilliseconds?: number;
  temporaryAccess: TemporaryAccessState;
}

export type TemporaryAccessStatus = 'available' | 'active' | 'cooldown';

export interface StandardBlockSnapshot {
  hostname: Hostname;
  status: TemporaryAccessStatus;
  usedMinutes: number;
  remainingMinutes: number;
  enabledDurations: TemporaryAccessMinutes[];
  activeUntil?: number;
  availableAt?: number;
}

export interface StandardBlockSettings {
  globalCooldownMilliseconds: number;
}
