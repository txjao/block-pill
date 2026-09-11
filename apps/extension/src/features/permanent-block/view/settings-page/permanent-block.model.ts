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
  initialHostname?: string;
  confirmationInitiallyOpen?: boolean;
}

export function usePermanentBlockModel({
  sendMessage,
  initialHostname,
  confirmationInitiallyOpen = false,
}: UsePermanentBlockModelProps) {
  const [blocks, setBlocks] = useState<PermanentBlock[]>([]);
  const [hostname, setHostname] = useState(initialHostname ?? '');
  const [confirmationOpen, setConfirmationOpen] = useState(
    confirmationInitiallyOpen && initialHostname !== undefined,
  );
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [highlightedHostname, setHighlightedHostname] = useState<string>();

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

  useEffect(() => {
    if (!highlightedHostname) return;
    const timeout = window.setTimeout(
      () => setHighlightedHostname(undefined),
      1200,
    );
    return () => window.clearTimeout(timeout);
  }, [highlightedHostname]);

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
      const added = response.blocks.find(
        (block) =>
          !blocks.some((current) => current.hostname === block.hostname),
      );
      setBlocks(response.blocks);
      setHighlightedHostname(added?.hostname);
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
    highlightedHostname,
    setHostname,
    setConfirmationOpen,
    submitBlock,
    createBlock,
  };
}
