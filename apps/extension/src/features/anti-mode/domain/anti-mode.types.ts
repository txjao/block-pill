import type { z } from 'zod';
import type {
  activateAntiModeInputSchema,
  antiAccessMinutesSchema,
  antiDurationUnitSchema,
  antiModeIdSchema,
} from './anti-mode.schema';

export type AntiModeId = z.output<typeof antiModeIdSchema>;
export type AntiDurationUnit = z.output<typeof antiDurationUnitSchema>;
export type AntiAccessMinutes = z.output<typeof antiAccessMinutesSchema>;

export interface AntiModeConfig {
  id: AntiModeId;
  enabled: boolean;
  permanent: boolean;
  createdAt?: number;
  commitmentEndsAt?: number;
  goals: string[];
  hobbies: string[];
  philosophicalKnowledge: boolean;
  domains: string[];
  warningDomains: string[];
  accessUntilByHostname: Record<string, number>;
}

export type ActivateAntiModeInput = z.output<
  typeof activateAntiModeInputSchema
>;
