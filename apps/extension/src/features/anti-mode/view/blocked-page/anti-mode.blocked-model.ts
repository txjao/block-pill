import { useEffect, useState } from 'preact/hooks';
import {
  ACTIVITY_MESSAGE_TYPE,
  sendActivityRequest,
} from '@/features/activity';
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

export function useAntiModeBlockedModel() {
  const parameters = new URLSearchParams(window.location.search);
  const mode = (parameters.get('mode') ?? 'anti-porn') as AntiModeId;
  const hostname = parameters.get('hostname') ?? '';
  const kind = parameters.get('kind') === 'warning' ? 'warning' : 'explicit';
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
      const response = await send({ type: ANTI_MODE_MESSAGE_TYPE.list });
      if (response.ok && 'configs' in response) {
        setConfig(response.configs.find((item) => item.id === mode));
      } else
        setFeedback(response.ok ? 'Resposta inesperada.' : response.message);
      setIsLoading(false);
    }

    void load();
  }, [mode, hostname]);

  function toggleFeeling(feeling: string): void {
    setFeelings((current) =>
      current.includes(feeling)
        ? current.filter((item) => item !== feeling)
        : [...current, feeling],
    );
  }

  async function saveReflection(): Promise<void> {
    if (!hostname) return;
    const response = await sendActivityRequest({
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
    const response = await send({
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
          sendActivityRequest({
            type: ACTIVITY_MESSAGE_TYPE.record,
            source: item.id,
            kind: 'access-granted',
            hostname,
            path: '/',
            durationMinutes: minutes,
          }),
        ),
      );
      window.location.assign(`https://${hostname}`);
      return;
    }
    setFeedback(response.ok ? 'Resposta inesperada.' : response.message);
    setIsLoading(false);
  }

  return {
    mode,
    hostname,
    kind,
    config,
    feelings,
    reason,
    need,
    feedback,
    isLoading,
    setReason,
    setNeed,
    toggleFeeling,
    saveReflection,
    requestAccess,
  };
}

export type AntiModeBlockedModel = ReturnType<typeof useAntiModeBlockedModel>;

async function send(request: AntiModeRequest): Promise<AntiModeResponse> {
  try {
    return await chrome.runtime.sendMessage<AntiModeRequest, AntiModeResponse>(
      request,
    );
  } catch {
    return { ok: false, message: 'Não foi possível comunicar com a extensão.' };
  }
}
