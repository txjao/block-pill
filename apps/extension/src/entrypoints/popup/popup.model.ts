import { useEffect, useState } from 'preact/hooks';
import type { AntiModeRequest, AntiModeResponse } from '../../features/anti-mode';
import { createPopupMock } from './popup.mock';

const documentationUrl = 'https://github.com/txjao/block-pill/blob/main/docs/BLOCKING_RULES.md';

export function usePopupModel() {
  const mock = createPopupMock();
  const [hostname, setHostname] = useState('site atual');
  const [incognitoAllowed, setIncognitoAllowed] = useState(true);
  const [incognitoStatus, setIncognitoStatus] = useState('consultando proteção');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void load();
  }, []);

  async function load(): Promise<void> {
    setIsLoading(true);
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.url) {
        const url = new URL(tab.url);
        if (url.hostname) setHostname(url.hostname);
      }

      const response = await send({ type: 'incognito/status' });
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
  }

  async function openOptions(section: 'blocking' | 'anti'): Promise<void> {
    try {
      await chrome.tabs.create({
        url: chrome.runtime.getURL(`src/entrypoints/options/index.html?section=${section}`),
      });
      window.close();
    } catch {
      setErrorMessage('Não foi possível abrir as configurações.');
    }
  }

  async function openDocumentation(): Promise<void> {
    try {
      await chrome.tabs.create({ url: documentationUrl });
      window.close();
    } catch {
      setErrorMessage('Não foi possível abrir a documentação.');
    }
  }

  return {
    ...mock,
    hostname,
    incognitoAllowed,
    incognitoStatus,
    errorMessage,
    isLoading,
    openOptions,
    openDocumentation,
  };
}

function formatIncognitoStatus(
  response: Extract<AntiModeResponse, { ok: true; incognitoAllowed: boolean }>,
): string {
  if (!response.incognitoAllowed) return 'permissão pendente';
  if (response.lockedByAntiMode) return 'proteção obrigatória ativa';
  if (!response.controlEnabled) return 'proteção desativada';
  if (response.blocked) return 'abertura bloqueada';
  if (response.suspendedUntil) {
    const time = new Intl.DateTimeFormat('pt-BR', { timeStyle: 'short' }).format(
      response.suspendedUntil,
    );
    return `pausada até ${time}`;
  }
  return 'proteção pronta';
}

async function send(request: AntiModeRequest): Promise<AntiModeResponse> {
  try {
    return await chrome.runtime.sendMessage<AntiModeRequest, AntiModeResponse>(request);
  } catch {
    return { ok: false, message: 'Não foi possível consultar a proteção anônima.' };
  }
}
