import { usePopupModel } from './popup.model';
import { readPopupPreview } from './popup.mock';
import { PopupView } from './popup.view';
import type { AntiModeRequest, AntiModeResponse } from '@/features/anti-mode';
import type {
  StandardBlockRequest,
  StandardBlockResponse,
} from '@/features/standard-block';

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

async function sendAntiModeMessage(
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

async function sendStandardBlockMessage(
  request: StandardBlockRequest,
): Promise<StandardBlockResponse> {
  try {
    return await chrome.runtime.sendMessage<
      StandardBlockRequest,
      StandardBlockResponse
    >(request);
  } catch {
    return {
      ok: false,
      message: 'Não foi possível consultar os bloqueios deste site.',
    };
  }
}

export function PopupPage() {
  const preview = import.meta.env.DEV
    ? readPopupPreview(globalThis.location.search)
    : undefined;
  const model = usePopupModel({
    closePopup,
    createExtensionUrl,
    openTab,
    queryActiveTabUrl,
    sendAntiModeMessage,
    sendStandardBlockMessage,
  });
  return <PopupView {...model} preview={preview} />;
}
