import { useCallback, useEffect, useState } from 'preact/hooks';
import {
  INCOGNITO_MESSAGE_TYPE,
  type AntiModeRequest,
  type AntiModeResponse,
} from '@/features/anti-mode';

const documentationUrl =
  'https://github.com/txjao/block-pill/blob/main/docs/BLOCKING_RULES.md';

export interface UsePopupModelProps {
  closePopup: () => void;
  createExtensionUrl: (path: string) => string;
  openTab: (url: string) => Promise<void>;
  queryActiveTabUrl: () => Promise<string | undefined>;
  sendMessage: (request: AntiModeRequest) => Promise<AntiModeResponse>;
}

export function usePopupModel({
  closePopup,
  createExtensionUrl,
  openTab,
  queryActiveTabUrl,
  sendMessage,
}: UsePopupModelProps) {
  const [hostname, setHostname] = useState('site atual');
  const [incognitoAllowed, setIncognitoAllowed] = useState(true);
  const [incognitoStatus, setIncognitoStatus] = useState(
    'consultando proteção',
  );
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      const activeTabUrl = await queryActiveTabUrl();
      if (activeTabUrl) {
        const url = new URL(activeTabUrl);
        if (url.hostname) setHostname(url.hostname);
      }

      const response = await sendMessage({
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
  }, [queryActiveTabUrl, sendMessage]);

  useEffect(() => {
    void load();
  }, [load]);

  async function openSettings(section: 'blocking' | 'anti'): Promise<void> {
    try {
      await openTab(
        createExtensionUrl(
          `src/entrypoints/settings/index.html?section=${section}`,
        ),
      );
      closePopup();
    } catch {
      setErrorMessage('Não foi possível abrir as configurações.');
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
    incognitoAllowed,
    incognitoStatus,
    errorMessage,
    isLoading,
    openSettings,
    openDocumentation,
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
