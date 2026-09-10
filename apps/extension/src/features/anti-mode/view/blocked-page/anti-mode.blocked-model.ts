import { useEffect, useState } from 'preact/hooks';
import { ACTIVITY_MESSAGE_TYPE } from '@/features/activity';
import type {
  ActivityRequest,
  ActivityResponse,
} from '@/features/activity/application/activity.messages';
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
const feelingOptions = [
  ['tristeza', '😔'],
  ['raiva', '😠'],
  ['frustração', '😣'],
  ['ansiedade', '😰'],
  ['solidão', '🫥'],
  ['impulso externo', '⚡'],
] as const;

export interface UseAntiModeBlockedModelProps {
  hostname: string | null;
  kind: string | null;
  mode: string | null;
  navigate: (url: string) => void;
  sendActivityMessage: (request: ActivityRequest) => Promise<ActivityResponse>;
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
  sendActivityMessage,
  sendMessage,
}: UseAntiModeBlockedModelProps) {
  const mode: AntiModeId =
    requestedMode === 'anti-bet' ? 'anti-bet' : 'anti-porn';
  const hostname = requestedHostname ?? '';
  const kind = requestedKind === 'warning' ? 'warning' : 'explicit';
  const [config, setConfig] = useState<AntiModeConfig>();
  const [feelings, setFeelings] = useState<string[]>([]);
  const [reason, setReason] = useState('');
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

  function toggleFeeling(feeling: string): void {
    setFeelings((current) =>
      current.includes(feeling)
        ? current.filter((item) => item !== feeling)
        : [...current, feeling],
    );
  }

  async function saveReflection(): Promise<void> {
    if (!hostname) return;
    const response = await sendActivityMessage({
      type: ACTIVITY_MESSAGE_TYPE.record,
      source: mode,
      kind: 'reflection',
      hostname,
      path: '/',
      feelings,
      reason,
    });
    setFeedback(
      response.ok ? 'Relato salvo somente neste navegador.' : response.message,
    );
  }

  async function requestAccess(minutes: AntiAccessMinutes): Promise<void> {
    setIsLoading(true);
    const response = await sendMessage({
      type: ANTI_MODE_MESSAGE_TYPE.grantAccess,
      mode,
      hostname,
      minutes,
    });
    if (response.ok && 'configs' in response) {
      const matchingModes = response.configs.filter(
        (item) => item.enabled && item.warningDomains.includes(hostname),
      );
      await Promise.all(
        matchingModes.map((item) =>
          sendActivityMessage({
            type: ACTIVITY_MESSAGE_TYPE.record,
            source: item.id,
            kind: 'access-granted',
            hostname,
            path: '/',
            durationMinutes: minutes,
          }),
        ),
      );
      navigate(`https://${hostname}`);
      return;
    }
    setFeedback(response.ok ? 'Resposta inesperada.' : response.message);
    setIsLoading(false);
  }

  return {
    accessDurations,
    feelingOptions,
    mode,
    hostname,
    kind,
    config,
    feelings,
    reason,
    need,
    feedback,
    isLoading,
    recommendationText: getRecommendationText(need, config?.hobbies ?? []),
    setReason,
    setNeed,
    toggleFeeling,
    saveReflection,
    requestAccess,
    title:
      mode === 'anti-porn'
        ? 'Seu compromisso anti-pornografia'
        : 'Seu compromisso anti-aposta',
  };
}