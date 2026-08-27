export type AntiModeId = 'anti-porn' | 'anti-bet';
export type AntiDurationUnit = 'days' | 'months' | 'years';
export type AntiAccessMinutes = 1 | 5 | 15;

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

export interface ActivateAntiModeInput {
  mode: AntiModeId;
  permanent: boolean;
  durationValue?: number;
  durationUnit?: AntiDurationUnit;
  goals: string[];
  hobbies: string[];
  philosophicalKnowledge: boolean;
  importFrom?: AntiModeId;
}
