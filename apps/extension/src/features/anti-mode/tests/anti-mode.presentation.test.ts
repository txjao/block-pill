import { describe, expect, it } from 'vitest';
import { formatCommitmentLabel, getRecommendationText } from '@/features/anti-mode/view/anti-mode.presentation';

describe('anti mode presentation', () => {
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
