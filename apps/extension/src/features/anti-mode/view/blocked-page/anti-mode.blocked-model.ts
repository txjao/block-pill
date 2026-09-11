import { useEffect, useState } from 'preact/hooks';
import { ANTI_MODE_MESSAGE_TYPE } from '@/features/anti-mode/application/anti-mode.messages.constants';
import type {
  AntiModeRequest,
  AntiModeResponse,
} from '@/features/anti-mode/application/anti-mode.messages';
import type {
  AntiAccessMinutes,
  AntiModeConfig,
  AntiModeId,
} from '@/features/anti-mode/domain/anti-mode.types';

export type AntiModeNeed = 'entertainment' | 'information' | 'impulse';

const accessDurations = [1, 5, 15] as const;
export interface UseAntiModeBlockedModelProps {
  hostname: string | null;
  kind: string | null;
  mode: string | null;
  navigate: (url: string) => void;
  sendMessage: (request: AntiModeRequest) => Promise<AntiModeResponse>;
}

export type AntiModeBlockedModel = ReturnType<typeof useAntiModeBlockedModel>;

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

export function useAntiModeBlockedModel({
  hostname: requestedHostname,
  kind: requestedKind,
  mode: requestedMode,
  navigate,
  sendMessage,
}: UseAntiModeBlockedModelProps) {
  const mode: AntiModeId =
    requestedMode === 'anti-bet' ? 'anti-bet' : 'anti-porn';
  const hostname = requestedHostname ?? '';
  const kind = requestedKind === 'warning' ? 'warning' : 'explicit';
  const [config, setConfig] = useState<AntiModeConfig>();
  const [need, setNeed] = useState<'entertainment' | 'information' | 'impulse'>(
    'impulse',
  );
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load(): Promise<void> {
      const response = await sendMessage({
        type: ANTI_MODE_MESSAGE_TYPE.list,
      });
      if (response.ok && 'configs' in response) {
        setConfig(response.configs.find((item) => item.id === mode));
      } else
        setFeedback(response.ok ? 'Resposta inesperada.' : response.message);
      setIsLoading(false);
    }

    void load();
  }, [hostname, mode, sendMessage]);

  async function requestAccess(minutes: AntiAccessMinutes): Promise<void> {
    setIsLoading(true);
    const response = await sendMessage({
      type: ANTI_MODE_MESSAGE_TYPE.grantAccess,
      mode,
      hostname,
      minutes,
    });
    if (response.ok && 'configs' in response) {
      navigate(`https://${hostname}`);
      return;
    }
    setFeedback(response.ok ? 'Resposta inesperada.' : response.message);
    setIsLoading(false);
  }

  return {
    accessDurations,
    mode,
    hostname,
    kind,
    config,
    need,
    feedback,
    isLoading,
    recommendationText: getRecommendationText(need, config?.hobbies ?? []),
    setNeed,
    requestAccess,
    title:
      mode === 'anti-porn'
        ? 'Seu compromisso anti-pornografia'
        : 'Seu compromisso anti-aposta',
  };
}
