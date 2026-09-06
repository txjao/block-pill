import { describe, expect, it } from 'vitest';
import { antiModeConfigSchema } from '@/features/anti-mode/domain/anti-mode.schema';

describe('anti mode schema', () => {
  it('preserves defaults required by stored legacy configs', () => {
    expect(antiModeConfigSchema.parse({ id: 'anti-porn' })).toEqual({
      id: 'anti-porn',
      enabled: false,
      permanent: false,
      goals: [],
      hobbies: [],
      philosophicalKnowledge: false,
      domains: [],
      warningDomains: [],
      accessUntilByHostname: {},
    });
  });
});
