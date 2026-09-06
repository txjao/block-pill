import { useEffect, useState } from 'preact/hooks';
import type { JSX } from 'preact';
import type {
  PermanentBlockRequest,
  PermanentBlockResponse,
} from '@/features/permanent-block/application/permanent-block.messages';
import { PERMANENT_BLOCK_MESSAGE_TYPE } from '@/features/permanent-block/application/permanent-block.messages.constants';
import type { PermanentBlock } from '@/features/permanent-block/domain/permanent-block.types';

export function usePermanentBlockModel() {
  const [blocks, setBlocks] = useState<PermanentBlock[]>([]);
  const [hostname, setHostname] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => void load(), []);

  async function load(): Promise<void> {
    setIsLoading(true);
    const response = await send({ type: PERMANENT_BLOCK_MESSAGE_TYPE.list });
    if (response.ok) setBlocks(response.blocks);
    else setFeedback(response.message);
    setIsLoading(false);
  }

  async function addBlock(event: JSX.TargetedSubmitEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!acknowledged) return;
    setIsLoading(true);
    const response = await send({
      type: PERMANENT_BLOCK_MESSAGE_TYPE.add,
      hostname: hostname.trim(),
    });

    if (response.ok) {
      setBlocks(response.blocks);
      setHostname('');
      setAcknowledged(false);
      setFeedback('Bloqueio permanente criado.');
    } else {
      setFeedback(response.message);
    }
    setIsLoading(false);
  }

  return {
    blocks,
    hostname,
    acknowledged,
    feedback,
    isLoading,
    setHostname,
    setAcknowledged,
    addBlock,
  };
}

async function send(request: PermanentBlockRequest): Promise<PermanentBlockResponse> {
  try {
    return await chrome.runtime.sendMessage<PermanentBlockRequest, PermanentBlockResponse>(request);
  } catch {
    return { ok: false, message: 'Não foi possível comunicar com a extensão.' };
  }
}
