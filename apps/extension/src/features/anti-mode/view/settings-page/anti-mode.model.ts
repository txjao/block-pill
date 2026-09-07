import { useCallback, useEffect, useState } from 'preact/hooks';
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

const modeCopy = {
  'anti-porn': {
    title: 'Anti-pornografia',
    description:
      'Reduza encontros impulsivos com conteúdo adulto e crie espaço para retomar seus objetivos.',
    domainHelp: 'Adicione sites adultos que não aparecem na proteção inicial.',
    count: '1.482 domínios na lista',
  },
  'anti-bet': {
    title: 'Anti-aposta',
    description:
      'Crie distância de bets, cassinos e estímulos que incentivam decisões financeiras por impulso.',
    domainHelp:
      'Adicione casas de aposta ou páginas promocionais que você encontrou.',
    count: 'proteção inicial e sites adicionados',
  },
} as const;

export interface UseAntiModeModelProps {
  now: () => number;
  selectedMode?: AntiModeId;
  sendMessage: (request: AntiModeRequest) => Promise<AntiModeResponse>;
  subscribeToFocus: (listener: () => void) => () => void;
}

export function useAntiModeModel({
  now,
  selectedMode = 'anti-porn',
  sendMessage,
  subscribeToFocus,
}: UseAntiModeModelProps) {
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

  const load = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    const [modes, incognito] = await Promise.all([
      sendMessage({ type: ANTI_MODE_MESSAGE_TYPE.list }),
      sendMessage({ type: INCOGNITO_MESSAGE_TYPE.status }),
    ]);
    if (modes.ok && 'configs' in modes) setConfigs(modes.configs);
    if (incognito.ok && 'incognitoAllowed' in incognito)
      setIncognitoAllowed(incognito.incognitoAllowed);
    setIsLoading(false);
  }, [sendMessage]);

  useEffect(() => {
    void load();
    const reloadPermission = () => void load();
    return subscribeToFocus(reloadPermission);
  }, [load, subscribeToFocus]);

  function updateDraft<K extends keyof Draft>(
    mode: AntiModeId,
    key: K,
    value: Draft[K],
  ): void {
    setDrafts((current) => ({
      ...current,
      [mode]: { ...current[mode], [key]: value },
    }));
  }

  async function activate(mode: AntiModeId): Promise<void> {
    const draft = drafts[mode];
    setIsLoading(true);
    const other: AntiModeId = mode === 'anti-porn' ? 'anti-bet' : 'anti-porn';
    const response = await sendMessage({
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
    const response = await sendMessage({
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
    const response = await sendMessage({
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
    await sendMessage({ type: INCOGNITO_MESSAGE_TYPE.openSettings });
  }

  function consumeConfigs(response: AntiModeResponse, message: string): void {
    if (response.ok && 'configs' in response) {
      setConfigs(response.configs);
      setFeedback(message);
    } else setFeedback(response.ok ? 'Resposta inesperada.' : response.message);
    setIsLoading(false);
  }

  const mode = selectedMode;
  const config = configs.find((item) => item.id === mode);
  const draft = drafts[mode];
  const active = config?.enabled ?? false;

  return {
    active,
    canDeactivate:
      active &&
      !config?.permanent &&
      (config?.commitmentEndsAt ?? Infinity) <= now(),
    canImportProfile: configs.some(
      (item) =>
        item.id !== mode && (item.goals.length > 0 || item.hobbies.length > 0),
    ),
    commitmentLabel: config ? formatCommitmentLabel(config) : undefined,
    config,
    copy: modeCopy[mode],
    configs,
    drafts,
    draft,
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
    mode,
  };
}

export type AntiModeModel = ReturnType<typeof useAntiModeModel>;

function splitList(value: string): string[] {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function formatCommitmentLabel(config: AntiModeConfig): string {
  return config.permanent
    ? 'Compromisso sem prazo definido'
    : `Protegido até ${new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long', timeStyle: 'short' }).format(config.commitmentEndsAt)}`;
}
