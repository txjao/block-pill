export type ActivitySource = 'standard' | 'permanent' | 'anti-porn' | 'anti-bet';

export type ActivityKind = 'created' | 'attempt' | 'access-granted' | 'reflection';

export interface ActivityEvent {
  id: string;
  source: ActivitySource;
  kind: ActivityKind;
  hostname: string;
  path: string;
  at: number;
  durationMinutes?: number;
  feelings?: string[];
  reason?: string;
}

export interface ActivityEventInput extends Omit<ActivityEvent, 'id' | 'at'> {}
