import type { AntiModeConfig } from '@/features/anti-mode/domain/anti-mode.types';

export type AntiModeNeed = 'entertainment' | 'information' | 'impulse';

export function formatCommitmentLabel(config: AntiModeConfig): string {
  return config.permanent
    ? 'Compromisso sem prazo definido'
    : `Protegido até ${new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long', timeStyle: 'short' }).format(config.commitmentEndsAt)}`;
}

export function getRecommendationText(
  need: AntiModeNeed,
  hobbies: string[],
): string | undefined {
  if (need === 'information') return undefined;
  if (need === 'entertainment') {
    return 'Que tal algo fora da tela: caminhar, ler, cozinhar, conversar ou praticar um esporte?';
  }
  const alternatives = hobbies.length
    ? hobbies.join(', ')
    : 'uma caminhada curta, alongamento ou uma tarefa manual';
  return `Direcione essa energia para ${alternatives}.`;
}
