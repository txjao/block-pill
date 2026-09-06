import { useEffect, useState } from 'preact/hooks';
import type { JSX } from 'preact';
import type {
  AntiModeRequest,
  AntiModeResponse,
} from '@/features/anti-mode/application/anti-mode.messages';
import {
  ANTI_MODE_MESSAGE_TYPE,
  INCOGNITO_MESSAGE_TYPE,
} from '@/features/anti-mode/application/anti-mode.messages.constants';
import type {
  AntiDurationUnit,
  AntiModeConfig,
  AntiModeId,
} from '@/features/anti-mode/domain/anti-mode.types';

interface Draft {
  durationValue: string;
  durationUnit: AntiDurationUnit;
  permanent: boolean;
  goals: string;
  hobbies: string;
  philosophicalKnowledge: boolean;
  importProfile: boolean;
  hostname: string;
}

const initialDraft: Draft = {
  durationValue: '31',
  durationUnit: 'days',
  permanent: false,
  goals: '',
  hobbies: '',
  philosophicalKnowledge: false,
  importProfile: false,
  hostname: '',
};

export function useAntiModeModel() {
  const [configs, setConfigs] = useState<AntiModeConfig[]>([]);
  const [drafts, setDrafts] = useState<Record<AntiModeId, Draft>>({
    'anti-porn': { ...initialDraft },
    'anti-bet': { ...initialDraft },
  });
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [incognitoAllowed, setIncognitoAllowed] = useState(false);
  const [pendingDeactivate, setPendingDeactivate] = useState<AntiModeId>();
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    void load();
    const reloadPermission = () => void load();
    window.addEventListener('focus', reloadPermission);
    return () => window.removeEventListener('focus', reloadPermission);
  }, []);

  async function load(): Promise<void> {
    setIsLoading(true);
    const [modes, incognito] = await Promise.all([
      send({ type: ANTI_MODE_MESSAGE_TYPE.list }),
      send({ type: INCOGNITO_MESSAGE_TYPE.status }),
    ]);
    if (modes.ok && 'configs' in modes) setConfigs(modes.configs);
    if (incognito.ok && 'incognitoAllowed' in incognito)
      setIncognitoAllowed(incognito.incognitoAllowed);
    setIsLoading(false);
  }

  function updateDraft<K extends keyof Draft>(mode: AntiModeId, key: K, value: Draft[K]): void {
    setDrafts((current) => ({ ...current, [mode]: { ...current[mode], [key]: value } }));
  }

  async function activate(mode: AntiModeId): Promise<void> {
    const draft = drafts[mode];
    setIsLoading(true);
    const other: AntiModeId = mode === 'anti-porn' ? 'anti-bet' : 'anti-porn';
    const response = await send({
      type: ANTI_MODE_MESSAGE_TYPE.activate,
      mode,
      permanent: draft.permanent,
      durationValue: draft.permanent ? undefined : Number(draft.durationValue),
      durationUnit: draft.durationUnit,
      goals: splitList(draft.goals),
      hobbies: splitList(draft.hobbies),
      philosophicalKnowledge: draft.philosophicalKnowledge,
      importFrom: draft.importProfile ? other : undefined,
    });
    consumeConfigs(response, 'Compromisso ativado.');
  }

  async function addDomain(
    mode: AntiModeId,
    event: JSX.TargetedSubmitEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    setIsLoading(true);
    const response = await send({
      type: ANTI_MODE_MESSAGE_TYPE.addDomain,
      mode,
      hostname: drafts[mode].hostname,
    });
    if (response.ok && 'configs' in response) {
      setConfigs(response.configs);
      updateDraft(mode, 'hostname', '');
      setFeedback('Domínio adicionado ao modo anti.');
    } else setFeedback(response.ok ? 'Resposta inesperada.' : response.message);
    setIsLoading(false);
  }

  async function confirmDeactivate(): Promise<void> {
    if (!pendingDeactivate) return;
    setIsLoading(true);
    const response = await send({
      type: ANTI_MODE_MESSAGE_TYPE.deactivate,
      mode: pendingDeactivate,
    });
    if (response.ok && 'configs' in response) {
      setConfigs(response.configs);
      setPendingDeactivate(undefined);
      setShowCelebration(true);
      setFeedback('');
    } else setFeedback(response.ok ? 'Resposta inesperada.' : response.message);
    setIsLoading(false);
  }

  async function openIncognitoSettings(): Promise<void> {
    await send({ type: INCOGNITO_MESSAGE_TYPE.openSettings });
  }

  function consumeConfigs(response: AntiModeResponse, message: string): void {
    if (response.ok && 'configs' in response) {
      setConfigs(response.configs);
      setFeedback(message);
    } else setFeedback(response.ok ? 'Resposta inesperada.' : response.message);
    setIsLoading(false);
  }

  return {
    configs,
    drafts,
    feedback,
    isLoading,
    incognitoAllowed,
    pendingDeactivate,
    showCelebration,
    updateDraft,
    activate,
    addDomain,
    setPendingDeactivate,
    confirmDeactivate,
    setShowCelebration,
    openIncognitoSettings,
  };
}

export type AntiModeModel = ReturnType<typeof useAntiModeModel>;

async function send(request: AntiModeRequest): Promise<AntiModeResponse> {
  try {
    return await chrome.runtime.sendMessage<AntiModeRequest, AntiModeResponse>(request);
  } catch {
    return { ok: false, message: 'Não foi possível comunicar com a extensão.' };
  }
}

function splitList(value: string): string[] {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}
