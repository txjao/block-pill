import { useEffect, useState } from 'preact/hooks';
import type {
  StandardBlockRequest,
  StandardBlockResponse,
} from '@/features/standard-block/application/standard-block.messages';
import { STANDARD_BLOCK_MESSAGE_TYPE } from '@/features/standard-block/application/standard-block.messages.constants';
import type {
  StandardBlockSnapshot,
  TemporaryAccessMinutes,
} from '@/features/standard-block/domain/standard-block.types';

export function useStandardBlockBlockedModel() {
  const hostname = new URLSearchParams(window.location.search).get('hostname') ?? '';
  const [attemptedHostname, setAttemptedHostname] = useState('');
  const [snapshot, setSnapshot] = useState<StandardBlockSnapshot>();
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void loadStatus();
  }, [hostname]);

  async function loadStatus() {
    if (!hostname) {
      setFeedback('Não foi possível identificar o domínio bloqueado.');
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const [response, contextResponse] = await Promise.all([
      send({ type: STANDARD_BLOCK_MESSAGE_TYPE.status, hostname }),
      send({ type: STANDARD_BLOCK_MESSAGE_TYPE.context }),
    ]);
    if (response.ok && 'snapshot' in response) {
      setSnapshot(response.snapshot);
      setFeedback('');
    } else setFeedback(response.ok ? 'Resposta inesperada.' : response.message);
    if (
      contextResponse.ok &&
      'context' in contextResponse &&
      contextResponse.context?.hostname === hostname
    ) {
      const attempted = contextResponse.context.attemptedHostname;
      if (attempted !== hostname && attempted.endsWith(`.${hostname}`))
        setAttemptedHostname(attempted);
    }
    setIsLoading(false);
  }

  async function allowSubdomain() {
    if (!attemptedHostname) return;
    setIsLoading(true);
    const response = await send({
      type: STANDARD_BLOCK_MESSAGE_TYPE.addSubdomainException,
      hostname,
      subdomain: attemptedHostname,
    });
    if (response.ok) {
      window.location.assign(`https://${attemptedHostname}`);
      return;
    }
    setFeedback(response.message);
    setIsLoading(false);
  }

  async function requestAccess(minutes: TemporaryAccessMinutes) {
    setIsLoading(true);
    const response = await send({
      type: STANDARD_BLOCK_MESSAGE_TYPE.requestAccess,
      hostname,
      minutes,
    });
    if (response.ok && 'snapshot' in response) {
      setSnapshot(response.snapshot);
      window.location.assign(`https://${hostname}`);
      return;
    }
    setFeedback(response.ok ? 'Resposta inesperada.' : response.message);
    setIsLoading(false);
  }

  return {
    hostname,
    attemptedHostname,
    snapshot,
    feedback,
    isLoading,
    requestAccess,
    allowSubdomain,
  };
}

async function send(request: StandardBlockRequest): Promise<StandardBlockResponse> {
  try {
    const response = await chrome.runtime.sendMessage<StandardBlockRequest, StandardBlockResponse>(
      request,
    );
    return response ?? { ok: false, message: 'A extensão não respondeu. Recarregue esta página.' };
  } catch {
    return { ok: false, message: 'Não foi possível comunicar com a extensão.' };
  }
}
