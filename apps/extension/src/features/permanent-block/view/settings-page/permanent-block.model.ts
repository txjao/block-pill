import { useCallback, useEffect, useState } from 'preact/hooks';
import type { JSX } from 'preact';
import type {
  PermanentBlockRequest,
  PermanentBlockResponse,
} from '@/features/permanent-block/application/permanent-block.messages';
import { PERMANENT_BLOCK_MESSAGE_TYPE } from '@/features/permanent-block/application/permanent-block.messages.constants';
import type { PermanentBlock } from '@/features/permanent-block/domain/permanent-block.types';

const documentationUrl =
  'https://github.com/txjao/block-pill/blob/main/docs/BLOCKING_RULES.md#bloqueio-permanente';

export interface UsePermanentBlockModelProps {
  sendMessage: (
    request: PermanentBlockRequest,
  ) => Promise<PermanentBlockResponse>;
}

export function usePermanentBlockModel({
  sendMessage,
}: UsePermanentBlockModelProps) {
  const [blocks, setBlocks] = useState<PermanentBlock[]>([]);
  const [hostname, setHostname] = useState('');
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    const response = await sendMessage({
      type: PERMANENT_BLOCK_MESSAGE_TYPE.list,
    });
    if (response.ok) setBlocks(response.blocks);
    else setFeedback(response.message);
    setIsLoading(false);
  }, [sendMessage]);

  useEffect(() => void load(), [load]);

  function submitBlock(event: JSX.TargetedSubmitEvent<HTMLFormElement>): void {
    event.preventDefault();
    setConfirmationOpen(true);
  }

  async function createBlock(): Promise<void> {
    setIsLoading(true);
    const response = await sendMessage({
      type: PERMANENT_BLOCK_MESSAGE_TYPE.add,
      hostname: hostname.trim(),
    });

    if (response.ok) {
      setBlocks(response.blocks);
      setHostname('');
      setConfirmationOpen(false);
      setFeedback('Bloqueio permanente criado.');
    } else {
      setFeedback(response.message);
    }
    setIsLoading(false);
  }

  return {
    documentationUrl,
    blocks,
    hostname,
    confirmationOpen,
    feedback,
    isLoading,
    setHostname,
    setConfirmationOpen,
    submitBlock,
    createBlock,
  };
}
