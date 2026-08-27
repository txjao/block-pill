import type { Hostname } from '../../../shared/site/hostname';

export interface PermanentBlock {
  hostname: Hostname;
  ruleId: number;
  createdAt: number;
}
