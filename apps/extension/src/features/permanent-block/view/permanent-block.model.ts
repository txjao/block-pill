import { useEffect, useState } from 'preact/hooks';
import type { JSX } from 'preact';
import type {
  PermanentBlockRequest,
  PermanentBlockResponse,
} from '../application/permanent-block.messages';
import type { PermanentBlock } from '../domain/permanent-block.types';

export function usePermanentBlockModel() {
  const [blocks, setBlocks] = useState<PermanentBlock[]>([]);
  const [hostname, setHostname] = useState('');
  const [pendingHostname, setPendingHostname] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => void load(), []);

  async function load(): Promise<void> {
    setIsLoading(true);
    const response = await send({ type: 'permanent-block/list' });
    if (response.ok) setBlocks(response.blocks);
    else setFeedback(response.message);
    setIsLoading(false);
  }

  function prepare(event: JSX.TargetedSubmitEvent<HTMLFormElement>): void {
    event.preventDefault();
    setPendingHostname(hostname.trim());
  }

  async function confirm(): Promise<void> {
    setIsLoading(true);
    const response = await send({
      type: 'permanent-block/add',
      hostname: pendingHostname,
    });

    if (response.ok) {
      setBlocks(response.blocks);
      setHostname('');
      setPendingHostname('');
      setFeedback('Bloqueio permanente criado.');
    } else {
      setFeedback(response.message);
    }
    setIsLoading(false);
  }

  return {
    blocks,
    hostname,
    pendingHostname,
    feedback,
    isLoading,
    setHostname,
    setPendingHostname,
    prepare,
    confirm,
  };
}

async function send(request: PermanentBlockRequest): Promise<PermanentBlockResponse> {
  try {
    return await chrome.runtime.sendMessage<PermanentBlockRequest, PermanentBlockResponse>(request);
  } catch {
    return { ok: false, message: 'Não foi possível comunicar com a extensão.' };
  }
}
