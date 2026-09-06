import { useEffect, useMemo, useState } from 'preact/hooks';
import type { ActivityEvent, ActivitySource } from '@/features/activity/domain/activity.types';
import { ACTIVITY_MESSAGE_TYPE } from '@/features/activity/application/activity.messages.constants';
import { sendActivityRequest } from '@/features/activity/view/activity.client';

export interface ActivitySummary {
  key: string;
  source: ActivitySource;
  hostname: string;
  attempts: number;
  grants: number;
  createdAt?: number;
  lastAttemptAt?: number;
  lastAccessAt?: number;
  longestWithoutAccessMs: number;
  feelings: Array<{ feeling: string; count: number }>;
}

export interface ActivityDeletionTarget {
  label: string;
  source?: ActivitySource;
  hostname?: string;
}

export function useActivityDashboardModel() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [deletionTarget, setDeletionTarget] = useState<ActivityDeletionTarget>();
  const [deletionConfirmed, setDeletionConfirmed] = useState(false);

  useEffect(() => void load(), []);

  const summaries = useMemo(() => createSummaries(events), [events]);

  async function load(): Promise<void> {
    setIsLoading(true);
    const response = await sendActivityRequest({ type: ACTIVITY_MESSAGE_TYPE.list });
    if (response.ok) setEvents(response.events);
    else setFeedback(response.message);
    setIsLoading(false);
  }

  async function confirmDeletion(): Promise<void> {
    if (!deletionTarget || !deletionConfirmed) return;
    setIsLoading(true);
    const response = await sendActivityRequest({
      type: ACTIVITY_MESSAGE_TYPE.remove,
      source: deletionTarget.source,
      hostname: deletionTarget.hostname,
    });
    if (response.ok) {
      setEvents(response.events);
      setFeedback('Registros locais excluídos. Os bloqueios continuam ativos.');
      setDeletionTarget(undefined);
      setDeletionConfirmed(false);
    } else {
      setFeedback(response.message);
    }
    setIsLoading(false);
  }

  function requestDeletion(target: ActivityDeletionTarget): void {
    setDeletionConfirmed(false);
    setDeletionTarget(target);
  }

  return {
    events,
    summaries,
    feedback,
    isLoading,
    deletionTarget,
    deletionConfirmed,
    requestDeletion,
    setDeletionTarget,
    setDeletionConfirmed,
    confirmDeletion,
  };
}

export type ActivityDashboardModel = ReturnType<typeof useActivityDashboardModel>;

export function createSummaries(events: ActivityEvent[]): ActivitySummary[] {
  const groups = new Map<string, ActivityEvent[]>();
  for (const event of events) {
    const key = `${event.source}:${event.hostname}`;
    groups.set(key, [...(groups.get(key) ?? []), event]);
  }

  return [...groups.entries()]
    .map(([key, group]) => {
      const sorted = [...group].sort((left, right) => left.at - right.at);
      const attempts = sorted.filter((event) => event.kind === 'attempt');
      const grants = sorted.filter((event) => event.kind === 'access-granted');
      const feelings = new Map<string, number>();
      for (const event of sorted) {
        for (const feeling of event.feelings ?? []) {
          feelings.set(feeling, (feelings.get(feeling) ?? 0) + 1);
        }
      }
      const firstEventAt = sorted[0]?.at ?? Date.now();
      const accessTimes = grants.map((event) => event.at);
      const intervals = [
        ...accessTimes.map((time, index) => time - (accessTimes[index - 1] ?? firstEventAt)),
        Date.now() - (accessTimes.at(-1) ?? firstEventAt),
      ];

      return {
        key,
        source: sorted[0]?.source ?? 'standard',
        hostname: sorted[0]?.hostname ?? '',
        attempts: attempts.length,
        grants: grants.length,
        createdAt: sorted.find((event) => event.kind === 'created')?.at,
        lastAttemptAt: attempts.at(-1)?.at,
        lastAccessAt: grants.at(-1)?.at,
        longestWithoutAccessMs: Math.max(0, ...intervals),
        feelings: [...feelings.entries()]
          .map(([feeling, count]) => ({ feeling, count }))
          .sort((left, right) => right.count - left.count),
      };
    })
    .sort((left, right) => right.attempts - left.attempts);
}
