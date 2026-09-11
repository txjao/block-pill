import type {
  AntiModeRequest,
  AntiModeResponse,
} from '@/features/anti-mode/application/anti-mode.messages';
import { useAntiModeBlockedModel } from './anti-mode.blocked-model';
import { AntiModeBlockedView } from './anti-mode.blocked-view';
import { useMemo } from 'preact/hooks';

function navigate(url: string): void {
  window.location.assign(url);
}

async function sendMessage(
  request: AntiModeRequest,
): Promise<AntiModeResponse> {
  try {
    return await chrome.runtime.sendMessage<AntiModeRequest, AntiModeResponse>(
      request,
    );
  } catch {
    return { ok: false, message: 'Não foi possível comunicar com a extensão.' };
  }
}

export function AntiModeBlockedPage() {
  const parameters = useMemo(
    () => new URLSearchParams(window.location.search),
    [],
  );
  const model = useAntiModeBlockedModel({
    hostname: parameters.get('hostname'),
    kind: parameters.get('kind'),
    mode: parameters.get('mode'),
    navigate,
    sendMessage,
  });
  return <AntiModeBlockedView {...model} />;
}
