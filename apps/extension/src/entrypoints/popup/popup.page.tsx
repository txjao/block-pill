import { usePopupModel } from './popup.model';
import { PopupView } from './popup.view';
import type { AntiModeRequest, AntiModeResponse } from '@/features/anti-mode';

function closePopup(): void {
  window.close();
}

function createExtensionUrl(path: string): string {
  return chrome.runtime.getURL(path);
}

async function openTab(url: string): Promise<void> {
  await chrome.tabs.create({ url });
}

async function queryActiveTabUrl(): Promise<string | undefined> {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  return tab?.url;
}

async function sendMessage(
  request: AntiModeRequest,
): Promise<AntiModeResponse> {
  try {
    return await chrome.runtime.sendMessage<AntiModeRequest, AntiModeResponse>(
      request,
    );
  } catch {
    return {
      ok: false,
      message: 'Não foi possível consultar a proteção anônima.',
    };
  }
}

export function PopupPage() {
  const model = usePopupModel({
    closePopup,
    createExtensionUrl,
    openTab,
    queryActiveTabUrl,
    sendMessage,
  });
  return <PopupView {...model} />;
}
