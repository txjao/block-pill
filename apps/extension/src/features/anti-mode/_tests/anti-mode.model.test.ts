import { describe, expect, it } from 'vitest';
import { getRecommendationText } from '@/features/anti-mode/view/blocked-page/anti-mode.blocked-model';
import { formatCommitmentLabel } from '@/features/anti-mode/view/settings-page/anti-mode.model';

describe('anti mode models', () => {
  it('describes a permanent commitment without a date', () => {
    expect(
      formatCommitmentLabel({
        id: 'anti-porn',
        enabled: true,
        permanent: true,
        goals: [],
        hobbies: [],
        philosophicalKnowledge: false,
        domains: [],
        warningDomains: [],
        accessUntilByHostname: {},
      }),
    ).toBe('Compromisso sem prazo definido');
  });

  it('uses configured hobbies in an impulse recommendation', () => {
    expect(getRecommendationText('impulse', ['ler', 'caminhar'])).toBe(
      'Direcione essa energia para ler, caminhar.',
    );
  });
});
