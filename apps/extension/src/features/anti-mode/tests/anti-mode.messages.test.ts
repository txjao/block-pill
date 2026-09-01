import { describe, expect, it } from 'vitest';
import { parseAntiModeRequest } from '../application/anti-mode.messages';

describe('anti mode messages', () => {
  it('normalizes activation goals and hobbies with domain schemas', () => {
    expect(
      parseAntiModeRequest({
        type: 'anti-mode/activate',
        mode: 'anti-porn',
        permanent: true,
        goals: ['  dormir melhor  '],
        hobbies: ['  leitura  '],
        philosophicalKnowledge: false,
      }),
    ).toMatchObject({
      goals: ['dormir melhor'],
      hobbies: ['leitura'],
    });
  });

  it('rejects unsupported access durations', () => {
    expect(
      parseAntiModeRequest({
        type: 'anti-mode/grant-access',
        mode: 'anti-porn',
        hostname: 'example.com',
        minutes: 10,
      }),
    ).toBeUndefined();
  });
});
