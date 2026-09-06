import type { ActivitySource } from '@/features/activity/domain/activity.types';
import { Badge } from '@/shared/ui/components/badge';
import { Button } from '@/shared/ui/components/button';
import type { ActivityDashboardModel } from './activity-dashboard.model';
import styles from './activity-dashboard.module.css';
import { ActivityDeletionDialog } from './components/activity-deletion-dialog';
import { ActivityModeCard } from './components/activity-mode-card';

const sources: ActivitySource[] = ['standard', 'permanent', 'anti-porn', 'anti-bet'];

export function ActivityDashboardView(props: ActivityDashboardModel) {
  const { events, feedback, requestDeletion } = props;

  return (
    <section aria-labelledby="dashboard-title">
      <div class={styles.pageHeader}>
        <div>
          <Badge variant="accent">Somente neste navegador</Badge>
          <h2 id="dashboard-title">Atividade por modo</h2>
          <p>
            Cada proteção tem seu próprio contexto. Os registros abaixo nunca saem do seu
            dispositivo.
          </p>
        </div>
      </div>

      <div class={styles.modeStack}>
        {sources.map((source) => (
          <ActivityModeCard key={source} source={source} {...props} />
        ))}
      </div>

      {events.length > 0 && (
        <Button
          className={styles.clearAll}
          variant="secondary"
          type="button"
          onClick={() => requestDeletion({ label: 'todo o histórico local' })}
        >
          Excluir todo o histórico local
        </Button>
      )}

      <ActivityDeletionDialog {...props} />
      {feedback && <p role="status">{feedback}</p>}
    </section>
  );
}
