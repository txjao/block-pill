import { useEffect } from 'preact/hooks';
import type {
  StandardBlockRequest,
  StandardBlockResponse,
} from '@/features/standard-block/application/standard-block.messages';
import { useStandardBlockModel } from './standard-block.model';
import { StandardBlockView } from './standard-block.view';

async function sendMessage(
  request: StandardBlockRequest,
): Promise<StandardBlockResponse> {
  try {
    const response = await chrome.runtime.sendMessage<
      StandardBlockRequest,
      StandardBlockResponse
    >(request);

    if (response && typeof response.ok === 'boolean') {
      return response;
    }

    throw new Error('Resposta inválida do service worker.');
  } catch {
    return {
      ok: false,
      message: 'Não foi possível comunicar com a extensão. Tente novamente.',
    };
  }
}

export function StandardBlockPage({
  onCountChange,
}: {
  onCountChange?: (count: number) => void;
}) {
  const model = useStandardBlockModel({ sendMessage });

  useEffect(
    () => onCountChange?.(model.blocks.length),
    [model.blocks.length, onCountChange],
  );

  return <StandardBlockView {...model} />;
}
