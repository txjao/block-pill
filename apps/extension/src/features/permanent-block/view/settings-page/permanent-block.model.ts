import { useCallback, useEffect, useState } from 'preact/hooks';
import type { JSX } from 'preact';
import type {
  PermanentBlockRequest,
  PermanentBlockResponse,
} from '@/features/permanent-block/application/permanent-block.messages';
import { PERMANENT_BLOCK_MESSAGE_TYPE } from '@/features/permanent-block/application/permanent-block.messages.constants';
import type { PermanentBlockConfirmationRepository } from '@/features/permanent-block/domain/permanent-block-confirmation.repository';
import type { PermanentBlock } from '@/features/permanent-block/domain/permanent-block.types';

const documentationUrl =
  'https://github.com/txjao/block-pill/blob/main/docs/BLOCKING_RULES.md#bloqueio-permanente';

export interface UsePermanentBlockModelProps {
  confirmationRepository: PermanentBlockConfirmationRepository;
  sendMessage: (
    request: PermanentBlockRequest,
  ) => Promise<PermanentBlockResponse>;
}

export function usePermanentBlockModel({
  confirmationRepository,
  sendMessage,
}: UsePermanentBlockModelProps) {
  const [blocks, setBlocks] = useState<PermanentBlock[]>([]);
  const [hostname, setHostname] = useState('');
  const [confirmationEnabled, setConfirmationEnabled] = useState(true);
  const [confirmationLoading, setConfirmationLoading] = useState(true);
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

  useEffect(() => {
    let mounted = true;
    void confirmationRepository
      .getEnabled()
      .then((enabled) => {
        if (mounted) setConfirmationEnabled(enabled);
      })
      .catch(() => {
        if (mounted)
          setFeedback(
            'Não foi possível carregar a preferência de confirmação. A confirmação continuará ativa.',
          );
      })
      .finally(() => {
        if (mounted) setConfirmationLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [confirmationRepository]);

  function submitBlock(event: JSX.TargetedSubmitEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (confirmationEnabled) {
      setConfirmationOpen(true);
      return;
    }

    void createBlock();
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

  async function changeConfirmationEnabled(enabled: boolean): Promise<void> {
    const previous = confirmationEnabled;
    setConfirmationEnabled(enabled);
    setConfirmationLoading(true);
    try {
      await confirmationRepository.setEnabled(enabled);
      setFeedback('Preferência de confirmação salva.');
    } catch {
      setConfirmationEnabled(previous);
      setFeedback('Não foi possível salvar a preferência. Tente novamente.');
    } finally {
      setConfirmationLoading(false);
    }
  }

  return {
    documentationUrl,
    blocks,
    hostname,
    confirmationEnabled,
    confirmationLoading,
    confirmationOpen,
    feedback,
    isLoading,
    setHostname,
    setConfirmationOpen,
    submitBlock,
    createBlock,
    changeConfirmationEnabled,
  };
}
