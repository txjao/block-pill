import type { Hostname } from '@/shared/web-address/domain';

export interface PermanentBlock {
  hostname: Hostname;
  ruleId: number;
  createdAt: number;
}
