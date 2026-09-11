import { useCallback, useEffect, useState } from 'preact/hooks';
import {
  INCOGNITO_MESSAGE_TYPE,
  type AntiModeRequest,
  type AntiModeResponse,
} from '@/features/anti-mode';
import {
  STANDARD_BLOCK_MESSAGE_TYPE,
  type StandardBlockRequest,
  type StandardBlockResponse,
  type StandardBlockSnapshot,
} from '@/features/standard-block';
import {
  createSettingsPath,
  resolvePopupSiteClassification,
  type PopupSiteClassification,
} from './popup-context';
import { stimulatingDomains } from './stimulating-sites';

const documentationUrl =
  'https://github.com/txjao/block-pill/blob/main/docs/BLOCKING_RULES.md';

export interface UsePopupModelProps {
  closePopup: () => void;
  createExtensionUrl: (path: string) => string;
  openTab: (url: string) => Promise<void>;
  queryActiveTabUrl: () => Promise<string | undefined>;
  sendAntiModeMessage: (request: AntiModeRequest) => Promise<AntiModeResponse>;
  sendStandardBlockMessage: (
    request: StandardBlockRequest,
  ) => Promise<StandardBlockResponse>;
}

export function usePopupModel({
  closePopup,
  createExtensionUrl,
  openTab,
  queryActiveTabUrl,
  sendAntiModeMessage,
  sendStandardBlockMessage,
}: UsePopupModelProps) {
  const [hostname, setHostname] = useState('site atual');
  const [siteClassification, setSiteClassification] =
    useState<PopupSiteClassification>({
      kind: 'outside',
      hostname: 'site atual',
    });
  const [standardSnapshot, setStandardSnapshot] =
    useState<StandardBlockSnapshot>();
  const [incognitoAllowed, setIncognitoAllowed] = useState(true);
  const [incognitoStatus, setIncognitoStatus] = useState(
    'consultando proteção',
  );
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [pendingAction, setPendingAction] = useState<
    'standard' | 'permanent'
  >();

  const load = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      const [activeTabUrl, standardResponse] = await Promise.all([
        queryActiveTabUrl(),
        sendStandardBlockMessage({ type: STANDARD_BLOCK_MESSAGE_TYPE.list }),
      ]);
      const classification = resolvePopupSiteClassification({
        currentUrl: activeTabUrl,
        standardBlocks:
          standardResponse.ok && 'blocks' in standardResponse
            ? standardResponse.blocks
            : [],
        stimulatingDomains: standardResponse.ok
          ? stimulatingDomains
          : new Set<string>(),
      });
      if (!standardResponse.ok) setErrorMessage(standardResponse.message);
      setHostname(classification.hostname);
      setSiteClassification(classification);

      if (classification.kind === 'paused') {
        const statusResponse = await sendStandardBlockMessage({
          type: STANDARD_BLOCK_MESSAGE_TYPE.status,
          hostname: classification.hostname,
        });
        if (statusResponse.ok && 'snapshot' in statusResponse) {
          setStandardSnapshot(statusResponse.snapshot);
        } else if (!statusResponse.ok) {
          setErrorMessage(statusResponse.message);
        }
      }

      const response = await sendAntiModeMessage({
        type: INCOGNITO_MESSAGE_TYPE.status,
      });
      if (response.ok && 'incognitoAllowed' in response) {
        setIncognitoAllowed(response.incognitoAllowed);
        setIncognitoStatus(formatIncognitoStatus(response));
      } else if (!response.ok) {
        setErrorMessage(response.message);
      }
    } catch {
      setErrorMessage('Não foi possível consultar o estado desta aba.');
    } finally {
      setIsLoading(false);
    }
  }, [queryActiveTabUrl, sendAntiModeMessage, sendStandardBlockMessage]);

  useEffect(() => {
    void load();
  }, [load]);

  async function openSettings(
    section: 'blocking' | 'anti',
    parameters: Record<string, string | undefined> = {},
  ): Promise<boolean> {
    try {
      await openTab(
        createExtensionUrl(createSettingsPath({ section, ...parameters })),
      );
      closePopup();
      return true;
    } catch {
      setErrorMessage('Não foi possível abrir as configurações.');
      return false;
    }
  }

  async function blockStandard(): Promise<void> {
    setPendingAction('standard');
    setErrorMessage('');
    const response = await sendStandardBlockMessage({
      type: STANDARD_BLOCK_MESSAGE_TYPE.add,
      hostname,
    });

    if (!response.ok) {
      setErrorMessage(response.message);
      setPendingAction(undefined);
      return;
    }

    const opened = await openSettings('blocking', {
      tab: 'flexible',
      highlight: hostname,
    });
    if (!opened) {
      setErrorMessage(
        'O site foi bloqueado, mas não foi possível abrir as configurações.',
      );
      setPendingAction(undefined);
    }
  }

  async function preparePermanentBlock(): Promise<void> {
    setPendingAction('permanent');
    setErrorMessage('');
    try {
      await openSettings('blocking', {
        tab: 'permanent',
        hostname,
        confirm: 'permanent',
      });
    } finally {
      setPendingAction(undefined);
    }
  }

  async function openDocumentation(): Promise<void> {
    try {
      await openTab(documentationUrl);
      closePopup();
    } catch {
      setErrorMessage('Não foi possível abrir a documentação.');
    }
  }

  return {
    hostname,
    siteClassification,
    standardSnapshot,
    incognitoAllowed,
    incognitoStatus,
    errorMessage,
    isLoading,
    pendingAction,
    openSettings,
    openDocumentation,
    blockStandard,
    preparePermanentBlock,
  };
}

function formatIncognitoStatus(
  response: Extract<AntiModeResponse, { ok: true; incognitoAllowed: boolean }>,
): string {
  if (!response.incognitoAllowed) return 'permissão necessária';
  if (response.lockedByAntiMode) return 'obrigatória durante o modo anti';
  if (!response.controlEnabled) return 'proteção desativada';
  if (response.blocked) return 'abertura bloqueada';
  if (response.suspendedUntil) {
    const time = new Intl.DateTimeFormat('pt-BR', {
      timeStyle: 'short',
    }).format(response.suspendedUntil);
    return `pausada até ${time}`;
  }
  return 'proteção ativa';
}
