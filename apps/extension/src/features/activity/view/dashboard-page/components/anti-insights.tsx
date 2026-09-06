import { Badge } from '@/shared/ui/components/badge';
import type { ActivityDashboardModel } from '@/features/activity/view/dashboard-page/activity-dashboard.model';
import { createAntiInsightData } from '@/features/activity/view/dashboard-page/activity-dashboard.presentation';
import styles from '@/features/activity/view/dashboard-page/activity-dashboard.module.css';

export function AntiInsights({
  events,
  summaries,
}: {
  events: ActivityDashboardModel['events'];
  summaries: ActivityDashboardModel['summaries'];
}) {
  const { commonFeelings, reflections } = createAntiInsightData(events, summaries);

  return (
    <div class={styles.insights}>
      <div>
        <h4>Emoções mais percebidas</h4>
        {commonFeelings.length ? (
          <div class={styles.feelingSummary}>
            {commonFeelings.map(([feeling, count]) => (
              <Badge key={feeling} variant="accent">
                {feeling}: {count}
              </Badge>
            ))}
          </div>
        ) : (
          <p>Nenhuma emoção registrada ainda.</p>
        )}
      </div>
      <div>
        <h4>Reflexões recentes</h4>
        {reflections.length ? (
          <ul class={styles.reflectionList}>
            {reflections.map((event) => (
              <li key={event.id}>
                <strong>{event.hostname}</strong>
                <small>{formatDate(event.at)}</small>
                {event.reason && <p>{event.reason}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <p>Nenhuma reflexão registrada ainda.</p>
        )}
      </div>
    </div>
  );
}

function formatDate(value?: number) {
  return value
    ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(value)
    : 'Sem registro';
}
