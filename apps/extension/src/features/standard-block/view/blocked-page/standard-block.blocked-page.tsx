import type {
  StandardBlockRequest,
  StandardBlockResponse,
} from '@/features/standard-block/application/standard-block.messages';
import { useStandardBlockBlockedModel } from './standard-block.blocked-model';
import { StandardBlockBlockedView } from './standard-block.blocked-view';

function navigate(url: string): void {
  window.location.assign(url);
}

function now(): number {
  return Date.now();
}

async function sendMessage(
  request: StandardBlockRequest,
): Promise<StandardBlockResponse> {
  try {
    const response = await chrome.runtime.sendMessage<
      StandardBlockRequest,
      StandardBlockResponse
    >(request);
    return (
      response ?? {
        ok: false,
        message: 'A extensão não respondeu. Recarregue esta página.',
      }
    );
  } catch {
    return { ok: false, message: 'Não foi possível comunicar com a extensão.' };
  }
}

export function StandardBlockBlockedPage() {
  const hostname = useMemo(
    () => new URLSearchParams(window.location.search).get('hostname'),
    [],
  );
  const model = useStandardBlockBlockedModel({
    hostname,
    navigate,
    now,
    sendMessage,
  });
  return <StandardBlockBlockedView {...model} />;
}
import { useMemo } from 'preact/hooks';
