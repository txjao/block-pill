import type { AntiModeId } from '@/features/anti-mode/domain/anti-mode.types';
import type {
  AntiModeRequest,
  AntiModeResponse,
} from '@/features/anti-mode/application/anti-mode.messages';
import { useAntiModeModel } from './anti-mode.model';
import { AntiModeView } from './anti-mode.view';

function now(): number {
  return Date.now();
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

function subscribeToFocus(listener: () => void): () => void {
  window.addEventListener('focus', listener);
  return () => window.removeEventListener('focus', listener);
}

export function AntiModePage({
  selectedMode,
}: { selectedMode?: AntiModeId } = {}) {
  const model = useAntiModeModel({
    now,
    selectedMode,
    sendMessage,
    subscribeToFocus,
  });
  return <AntiModeView {...model} />;
}
