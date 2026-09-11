import { describe, expect, it } from 'vitest';
import { parseAntiModeRequest } from '@/features/anti-mode/application/anti-mode.messages';
import { ANTI_MODE_MESSAGE_TYPE } from '@/features/anti-mode/application/anti-mode.messages.constants';

describe('anti mode messages', () => {
  it('normalizes activation goals and hobbies with domain schemas', () => {
    expect(
      parseAntiModeRequest({
        type: ANTI_MODE_MESSAGE_TYPE.activate,
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
        type: ANTI_MODE_MESSAGE_TYPE.grantAccess,
        mode: 'anti-porn',
        hostname: 'example.com',
        minutes: 10,
      }),
    ).toBeUndefined();
  });
});
