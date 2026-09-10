import { useEffect } from 'preact/hooks';
import type {
  PermanentBlockRequest,
  PermanentBlockResponse,
} from '@/features/permanent-block/application/permanent-block.messages';
import { usePermanentBlockModel } from './permanent-block.model';
import { PermanentBlockView } from './permanent-block.view';
import { ChromePermanentBlockConfirmationRepository } from '@/features/permanent-block/infrastructure/permanent-block-confirmation.repository.chrome';

const confirmationRepository = new ChromePermanentBlockConfirmationRepository();

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
}: {
  onCountChange?: (count: number) => void;
}) {
  const model = usePermanentBlockModel({
    confirmationRepository,
    sendMessage,
  });

  useEffect(
    () => onCountChange?.(model.blocks.length),
    [model.blocks.length, onCountChange],
  );

  return <PermanentBlockView {...model} />;
}
