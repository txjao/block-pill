import { useEffect, useState } from 'preact/hooks';
import { sendActivityRequest } from '../../activity';
import type { AntiModeRequest, AntiModeResponse } from '../application/anti-mode.messages';
import type { AntiAccessMinutes, AntiModeConfig, AntiModeId } from '../domain/anti-mode.types';

export function useAntiModeBlockedModel() {
  const parameters = new URLSearchParams(window.location.search);
  const mode = (parameters.get('mode') ?? 'anti-porn') as AntiModeId;
  const hostname = parameters.get('hostname') ?? '';
  const kind = parameters.get('kind') === 'warning' ? 'warning' : 'explicit';
  const [config, setConfig] = useState<AntiModeConfig>();
  const [feelings, setFeelings] = useState<string[]>([]);
  const [reason, setReason] = useState('');
  const [need, setNeed] = useState<'entertainment' | 'information' | 'impulse'>('impulse');
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void load();
  }, [mode, hostname]);

  async function load(): Promise<void> {
    const response = await send({ type: 'anti-mode/list' });
    if (response.ok && 'configs' in response) {
      setConfig(response.configs.find((item) => item.id === mode));
    } else setFeedback(response.ok ? 'Resposta inesperada.' : response.message);
    setIsLoading(false);
  }

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
      type: 'activity/record',
      source: mode,
      kind: 'reflection',
      hostname,
      path: '/',
      feelings,
      reason,
    });
    setFeedback(response.ok ? 'Relato salvo somente neste navegador.' : response.message);
  }

  async function requestAccess(minutes: AntiAccessMinutes): Promise<void> {
    setIsLoading(true);
    const response = await send({ type: 'anti-mode/grant-access', mode, hostname, minutes });
    if (response.ok && 'configs' in response) {
      const matchingModes = response.configs.filter(
        (item) => item.enabled && item.warningDomains.includes(hostname),
      );
      await Promise.all(
        matchingModes.map((item) =>
          sendActivityRequest({
            type: 'activity/record',
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

async function send(request: AntiModeRequest): Promise<AntiModeResponse> {
  try {
    return await chrome.runtime.sendMessage<AntiModeRequest, AntiModeResponse>(request);
  } catch {
    return { ok: false, message: 'Não foi possível comunicar com a extensão.' };
  }
}
