import type { Clock } from '@/shared/current-time/domain';

export const systemClock = {
  now: () => Date.now(),
} satisfies Clock;
