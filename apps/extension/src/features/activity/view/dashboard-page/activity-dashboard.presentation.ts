import type { ActivityDashboardModel } from './activity-dashboard.model';

export function createModeMetrics(
  summaries: ActivityDashboardModel['summaries'],
) {
  return {
    attempts: summaries.reduce((total, item) => total + item.attempts, 0),
    grants: summaries.reduce((total, item) => total + item.grants, 0),
    sites: summaries.length,
  };
}

export function createAntiInsightData(
  events: ActivityDashboardModel['events'],
  summaries: ActivityDashboardModel['summaries'],
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
      .slice(0, 3),
  };
}
