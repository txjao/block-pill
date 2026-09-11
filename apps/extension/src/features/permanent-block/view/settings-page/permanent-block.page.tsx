import { useEffect } from 'preact/hooks';
import type {
  PermanentBlockRequest,
  PermanentBlockResponse,
} from '@/features/permanent-block/application/permanent-block.messages';
import { usePermanentBlockModel } from './permanent-block.model';
import { PermanentBlockView } from './permanent-block.view';

async function sendMessage(
  request: PermanentBlockRequest,
): Promise<PermanentBlockResponse> {
  try {
    return await chrome.runtime.sendMessage<
      PermanentBlockRequest,
      PermanentBlockResponse
    >(request);
  } catch {
    return { ok: false, message: 'Não foi possível comunicar com a extensão.' };
  }
}

export function PermanentBlockPage({
  onCountChange,
  initialHostname,
  confirmationInitiallyOpen,
}: {
  onCountChange?: (count: number) => void;
  initialHostname?: string;
  confirmationInitiallyOpen?: boolean;
}) {
  const model = usePermanentBlockModel({
    sendMessage,
    initialHostname,
    confirmationInitiallyOpen,
  });

  useEffect(
    () => onCountChange?.(model.blocks.length),
    [model.blocks.length, onCountChange],
  );

  return <PermanentBlockView {...model} />;
}
