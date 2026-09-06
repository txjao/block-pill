import { useEffect, useMemo, useState } from 'preact/hooks';
import type { JSX } from 'preact';
import type {
  StandardBlockRequest,
  StandardBlockResponse,
} from '@/features/standard-block/application/standard-block.messages';
import { STANDARD_BLOCK_MESSAGE_TYPE } from '@/features/standard-block/application/standard-block.messages.constants';
import type { StandardBlock } from '@/features/standard-block/domain/standard-block.types';

export function useStandardBlockModel() {
  const [blocks, setBlocks] = useState<StandardBlock[]>([]);
  const [hostname, setHostname] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [globalCooldownHours, setGlobalCooldownHours] = useState('1');
  const blockRows = useMemo(
    () => createStandardBlockRows(blocks, globalCooldownHours),
    [blocks, globalCooldownHours],
  );

  useEffect(() => {
    void loadBlocks();
  }, []);

  async function loadBlocks() {
    setIsLoading(true);
    const response = await sendStandardBlockMessage({
      type: STANDARD_BLOCK_MESSAGE_TYPE.settings,
    });

    if (response.ok && 'blocks' in response) {
      setBlocks(response.blocks);
      if ('settings' in response) {
        setGlobalCooldownHours(
          String(response.settings.globalCooldownMilliseconds / 3_600_000),
        );
      }
      setFeedback('');
    } else {
      setFeedback(
        response.ok ? 'Resposta inesperada da extensão.' : response.message,
      );
    }

    setIsLoading(false);
  }

  async function addBlock(event: JSX.TargetedSubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const response = await sendStandardBlockMessage({
      type: STANDARD_BLOCK_MESSAGE_TYPE.add,
      hostname,
    });

    if (response.ok && 'blocks' in response) {
      setBlocks(response.blocks);
      setHostname('');
      setFeedback('Domínio bloqueado.');
    } else {
      setFeedback(
        response.ok ? 'Resposta inesperada da extensão.' : response.message,
      );
    }

    setIsLoading(false);
  }

  async function removeBlock(block: StandardBlock) {
    setIsLoading(true);
    const response = await sendStandardBlockMessage({
      type: STANDARD_BLOCK_MESSAGE_TYPE.remove,
      hostname: block.hostname,
    });

    if (response.ok && 'blocks' in response) {
      setBlocks(response.blocks);
      setFeedback('Domínio removido dos bloqueios padrão.');
    } else {
      setFeedback(
        response.ok ? 'Resposta inesperada da extensão.' : response.message,
      );
    }

    setIsLoading(false);
  }

  async function saveGlobalCooldown(
    event: JSX.TargetedSubmitEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setIsLoading(true);
    const response = await sendStandardBlockMessage({
      type: STANDARD_BLOCK_MESSAGE_TYPE.updateSettings,
      globalCooldownMilliseconds: Number(globalCooldownHours) * 3_600_000,
    });
    if (response.ok && 'settings' in response) {
      setBlocks(response.blocks);
      setFeedback('Cooldown global atualizado.');
    } else
      setFeedback(
        response.ok ? 'Resposta inesperada da extensão.' : response.message,
      );
    setIsLoading(false);
  }

  async function saveDomainCooldown(
    block: StandardBlock,
    event: JSX.TargetedSubmitEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const value = readFormText(form, 'cooldownHours').trim();
    setIsLoading(true);
    const response = await sendStandardBlockMessage({
      type: STANDARD_BLOCK_MESSAGE_TYPE.updateDomainCooldown,
      hostname: block.hostname,
      cooldownMilliseconds: value ? Number(value) * 3_600_000 : null,
    });
    if (response.ok && 'blocks' in response) {
      setBlocks(response.blocks);
      setFeedback(
        value
          ? 'Cooldown específico atualizado.'
          : 'O domínio voltou a usar o cooldown global.',
      );
    } else
      setFeedback(
        response.ok ? 'Resposta inesperada da extensão.' : response.message,
      );
    setIsLoading(false);
  }

  async function addSubdomainException(
    block: StandardBlock,
    event: JSX.TargetedSubmitEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const subdomain = readFormText(form, 'subdomain');
    setIsLoading(true);
    const response = await sendStandardBlockMessage({
      type: STANDARD_BLOCK_MESSAGE_TYPE.addSubdomainException,
      hostname: block.hostname,
      subdomain,
    });
    if (response.ok && 'blocks' in response) {
      setBlocks(response.blocks);
      event.currentTarget.reset();
      setFeedback(
        'Subdomínio liberado. O domínio principal continua bloqueado.',
      );
    } else
      setFeedback(
        response.ok ? 'Resposta inesperada da extensão.' : response.message,
      );
    setIsLoading(false);
  }

  return {
    blocks,
    blockRows,
    hostname,
    feedback,
    isLoading,
    globalCooldownHours,
    setHostname,
    setGlobalCooldownHours,
    addBlock,
    removeBlock,
    saveGlobalCooldown,
    saveDomainCooldown,
    addSubdomainException,
  };
}

export type StandardBlockModel = ReturnType<typeof useStandardBlockModel>;

export function createStandardBlockRows(
  blocks: StandardBlock[],
  globalCooldownHours: string,
) {
  return blocks.map((block) => ({
    block,
    cooldownLabel: block.cooldownMilliseconds
      ? `espera própria de ${block.cooldownMilliseconds / 3_600_000} h`
      : `espera geral de ${globalCooldownHours} h`,
  }));
}

function readFormText(form: FormData, field: string): string {
  const value = form.get(field);
  return typeof value === 'string' ? value : '';
}

async function sendStandardBlockMessage(
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
