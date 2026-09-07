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

const accessDurations = [1, 5, 15] as const;
const documentationUrl =
  'https://github.com/txjao/block-pill/blob/main/docs/BLOCKING_RULES.md#exceções-de-subdomínio';

export interface UseStandardBlockBlockedModelProps {
  hostname: string | null;
  navigate: (url: string) => void;
  now: () => number;
  sendMessage: (
    request: StandardBlockRequest,
  ) => Promise<StandardBlockResponse>;
}

export function useStandardBlockBlockedModel({
  hostname: requestedHostname,
  navigate,
  now,
  sendMessage,
}: UseStandardBlockBlockedModelProps) {
  const hostname = requestedHostname ?? '';
  const [attemptedHostname, setAttemptedHostname] = useState('');
  const [snapshot, setSnapshot] = useState<StandardBlockSnapshot>();
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStatus(): Promise<void> {
      if (!hostname) {
        setFeedback('Não foi possível identificar o domínio bloqueado.');
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      const [response, contextResponse] = await Promise.all([
        sendMessage({ type: STANDARD_BLOCK_MESSAGE_TYPE.status, hostname }),
        sendMessage({ type: STANDARD_BLOCK_MESSAGE_TYPE.context }),
      ]);
      if (response.ok && 'snapshot' in response) {
        setSnapshot(response.snapshot);
        setFeedback('');
      } else
        setFeedback(response.ok ? 'Resposta inesperada.' : response.message);
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

    void loadStatus();
  }, [hostname, sendMessage]);

  async function allowSubdomain() {
    if (!attemptedHostname) return;
    setIsLoading(true);
    const response = await sendMessage({
      type: STANDARD_BLOCK_MESSAGE_TYPE.addSubdomainException,
      hostname,
      subdomain: attemptedHostname,
    });
    if (response.ok) {
      navigate(`https://${attemptedHostname}`);
      return;
    }
    setFeedback(response.message);
    setIsLoading(false);
  }

  async function requestAccess(minutes: TemporaryAccessMinutes) {
    setIsLoading(true);
    const response = await sendMessage({
      type: STANDARD_BLOCK_MESSAGE_TYPE.requestAccess,
      hostname,
      minutes,
    });
    if (response.ok && 'snapshot' in response) {
      setSnapshot(response.snapshot);
      navigate(`https://${hostname}`);
      return;
    }
    setFeedback(response.ok ? 'Resposta inesperada.' : response.message);
    setIsLoading(false);
  }

  return {
    accessDurations,
    availableIn:
      snapshot?.status === 'cooldown'
        ? formatRemaining(snapshot.availableAt, now())
        : undefined,
    documentationUrl,
    hostname,
    attemptedHostname,
    snapshot,
    feedback,
    isLoading,
    requestAccess,
    allowSubdomain,
  };
}

function formatRemaining(availableAt: number | undefined, currentTime: number) {
  if (!availableAt) return 'alguns instantes';
  const minutes = Math.ceil(Math.max(0, availableAt - currentTime) / 60_000);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.ceil(minutes / 60);
  return hours < 48 ? `${hours} h` : `${Math.ceil(hours / 24)} dias`;
}
