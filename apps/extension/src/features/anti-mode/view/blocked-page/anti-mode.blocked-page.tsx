import type {
  ActivityRequest,
  ActivityResponse,
} from '@/features/activity/application/activity.messages';
import type {
  AntiModeRequest,
  AntiModeResponse,
} from '@/features/anti-mode/application/anti-mode.messages';
import { useAntiModeBlockedModel } from './anti-mode.blocked-model';
import { AntiModeBlockedView } from './anti-mode.blocked-view';

function navigate(url: string): void {
  window.location.assign(url);
}

async function sendActivityMessage(
  request: ActivityRequest,
): Promise<ActivityResponse> {
  try {
    return await chrome.runtime.sendMessage<ActivityRequest, ActivityResponse>(
      request,
    );
  } catch {
    return {
      ok: false,
      message: 'Não foi possível atualizar o histórico local.',
    };
  }
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
    sendActivityMessage,
    sendMessage,
  });
  return <AntiModeBlockedView {...model} />;
}
import { useMemo } from 'preact/hooks';
