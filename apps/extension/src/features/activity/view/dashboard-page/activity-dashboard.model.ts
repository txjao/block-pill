import { useCallback, useEffect, useMemo, useState } from 'preact/hooks';
import type {
  ActivityEvent,
  ActivitySource,
} from '@/features/activity/domain/activity.types';
import type {
  ActivityRequest,
  ActivityResponse,
} from '@/features/activity/application/activity.messages';
import { ACTIVITY_MESSAGE_TYPE } from '@/features/activity/application/activity.messages.constants';

const activitySources: ActivitySource[] = [
  'standard',
  'permanent',
  'anti-porn',
  'anti-bet',
];

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
  feelings: { feeling: string; count: number }[];
}

export interface ActivityDeletionTarget {
  label: string;
  source?: ActivitySource;
  hostname?: string;
}

export interface ActivityModeViewModel {
  description: string;
  events: ActivityEvent[];
  insights?: ReturnType<typeof createAntiInsightData>;
  label: string;
  metrics: ReturnType<typeof createModeMetrics>;
  metricItems: { label: string; value: number }[];
  source: ActivitySource;
  summaries: (ActivitySummary & { lastAttemptLabel: string })[];
  title: string;
}

export interface UseActivityDashboardModelProps {
  now: () => number;
  sendMessage: (request: ActivityRequest) => Promise<ActivityResponse>;
}

export function useActivityDashboardModel({
  now,
  sendMessage,
}: UseActivityDashboardModelProps) {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [selectedSource, setSelectedSource] = useState('standard');
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [deletionTarget, setDeletionTarget] =
    useState<ActivityDeletionTarget>();
  const [deletionConfirmed, setDeletionConfirmed] = useState(false);

  const summaries = useMemo(
    () => createSummaries(events, now()),
    [events, now],
  );
  const modes = useMemo(
    () => createActivityModes(events, summaries),
    [events, summaries],
  );

  const load = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    const response = await sendMessage({
      type: ACTIVITY_MESSAGE_TYPE.list,
    });
    if (response.ok) setEvents(response.events);
    else setFeedback(response.message);
    setIsLoading(false);
  }, [sendMessage]);

  useEffect(() => void load(), [load]);

  async function confirmDeletion(): Promise<void> {
    if (!deletionTarget || !deletionConfirmed) return;
    setIsLoading(true);
    const response = await sendMessage({
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
    selectedSource,
    setSelectedSource,
    modeTabs: modes.map((mode) => ({ value: mode.source, label: mode.label })),
    events,
    summaries,
    feedback,
    isLoading,
    modes,
    deletionTarget,
    deletionConfirmed,
    requestDeletion,
    setDeletionTarget,
    setDeletionConfirmed,
    confirmDeletion,
  };
}

function createActivityModes(
  events: ActivityEvent[],
  summaries: ActivitySummary[],
): ActivityModeViewModel[] {
  return activitySources.map((source) => {
    const modeEvents = events.filter((event) => event.source === source);
    const modeSummaries = summaries.filter(
      (summary) => summary.source === source,
    );

    return {
      description: modeDescription(source),
      events: modeEvents,
      insights: source.startsWith('anti')
        ? createAntiInsightData(modeEvents, modeSummaries)
        : undefined,
      label: sourceLabel(source),
      metrics: createModeMetrics(modeSummaries),
      metricItems: [
        {
          label: 'Tentativas interrompidas',
          value: modeSummaries.reduce((sum, item) => sum + item.attempts, 0),
        },
        ...(source === 'permanent'
          ? []
          : [
              {
                label: 'Acessos temporários',
                value: modeSummaries.reduce(
                  (sum, item) => sum + item.grants,
                  0,
                ),
              },
            ]),
        { label: 'Sites registrados', value: modeSummaries.length },
        ...(source.startsWith('anti')
          ? [
              {
                label: 'Relatos registrados',
                value: modeEvents.filter((event) => event.kind === 'reflection')
                  .length,
              },
            ]
          : []),
      ],
      source,
      summaries: modeSummaries.map((summary) => ({
        ...summary,
        lastAttemptLabel: formatDate(summary.lastAttemptAt),
      })),
      title: modeTitle(source),
    };
  });
}

export type ActivityDashboardModel = ReturnType<
  typeof useActivityDashboardModel
>;

export function createSummaries(
  events: ActivityEvent[],
  currentTime: number,
): ActivitySummary[] {
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
      const firstEventAt = sorted[0]?.at ?? currentTime;
      const accessTimes = grants.map((event) => event.at);
      const intervals = [
        ...accessTimes.map(
          (time, index) => time - (accessTimes[index - 1] ?? firstEventAt),
        ),
        currentTime - (accessTimes.at(-1) ?? firstEventAt),
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

export function createModeMetrics(summaries: ActivitySummary[]) {
  return {
    attempts: summaries.reduce((total, item) => total + item.attempts, 0),
    grants: summaries.reduce((total, item) => total + item.grants, 0),
    sites: summaries.length,
  };
}

export function createAntiInsightData(
  events: ActivityEvent[],
  summaries: ActivitySummary[],
) {
  const feelings = new Map<string, number>();
  summaries.forEach((summary) =>
    summary.feelings.forEach((item) =>
      feelings.set(
        item.feeling,
        (feelings.get(item.feeling) ?? 0) + item.count,
      ),
    ),
  );

  return {
    commonFeelings: [...feelings.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4),
    reflections: events
      .filter((event) => event.kind === 'reflection')
      .slice()
      .reverse()
      .slice(0, 3)
      .map((event) => ({ ...event, dateLabel: formatDate(event.at) })),
  };
}

function sourceLabel(source: ActivitySource) {
  return {
    standard: 'Padrão',
    permanent: 'Permanente',
    'anti-porn': 'Anti-pornografia',
    'anti-bet': 'Anti-aposta',
  }[source];
}

function modeTitle(source: ActivitySource) {
  return {
    standard: 'Pausas flexíveis',
    permanent: 'Decisões permanentes',
    'anti-porn': 'Proteção contra pornografia',
    'anti-bet': 'Proteção contra apostas',
  }[source];
}

function modeDescription(source: ActivitySource) {
  return {
    standard:
      'Veja onde uma pequena fricção ajudou a interromper o automático.',
    permanent:
      'Acompanhe as tentativas barradas pelas decisões que você tornou definitivas.',
    'anti-porn':
      'Observe gatilhos e sentimentos sem julgamento para reconhecer padrões.',
    'anti-bet':
      'Entenda momentos de impulso e preserve distância de decisões financeiras rápidas.',
  }[source];
}

function formatDate(value?: number) {
  return value
    ? new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short',
      }).format(value)
    : 'Sem registro';
}
