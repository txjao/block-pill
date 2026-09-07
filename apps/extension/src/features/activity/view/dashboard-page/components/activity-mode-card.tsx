import { Badge } from '@/shared/ui/components/badge';
import { Button } from '@/shared/ui/components/button';
import type {
  ActivityDashboardModel,
  ActivityModeViewModel,
} from '@/features/activity/view/dashboard-page/activity-dashboard.model';
import styles from '@/features/activity/view/dashboard-page/activity-dashboard.module.css';
import { AntiInsights } from './anti-insights';

type ActivityModeCardProps = Pick<
  ActivityDashboardModel,
  'isLoading' | 'requestDeletion'
> & { mode: ActivityModeViewModel };

export function ActivityModeCard(props: ActivityModeCardProps) {
  const { mode, isLoading, requestDeletion } = props;
  const {
    description,
    events,
    insights,
    label,
    metrics,
    source,
    summaries,
    title,
  } = mode;

  return (
    <article class={styles.modeCard}>
      <header>
        <div>
          <Badge variant={source.startsWith('anti') ? 'accent' : 'neutral'}>
            {label}
          </Badge>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
        {events.length > 0 && (
          <Button
            className={styles.dangerText}
            variant="text"
            type="button"
            onClick={() =>
              requestDeletion({
                label: `todos os registros de ${label}`,
                source,
              })
            }
          >
            Limpar registros
          </Button>
        )}
      </header>

      <div class={styles.metricRow}>
        <div>
          <strong>{metrics.attempts}</strong>
          <span>Tentativas interrompidas</span>
        </div>
        <div>
          <strong>{metrics.grants}</strong>
          <span>Acessos temporários</span>
        </div>
        <div>
          <strong>{metrics.sites}</strong>
          <span>Sites registrados</span>
        </div>
      </div>

      {summaries.length ? (
        <ul class={styles.domainList}>
          {summaries.map((summary) => (
            <li key={summary.key}>
              <div>
                <strong>{summary.hostname}</strong>
                <small>Última tentativa: {summary.lastAttemptLabel}</small>
              </div>
              <div class={styles.domainMetrics}>
                <span>{summary.attempts} tentativas</span>
                {summary.grants > 0 && <span>{summary.grants} liberações</span>}
              </div>
              <Button
                variant="text"
                type="button"
                onClick={() =>
                  requestDeletion({
                    label: `${label} em ${summary.hostname}`,
                    source: summary.source,
                    hostname: summary.hostname,
                  })
                }
              >
                Excluir dados deste site
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p class={styles.emptyState}>
          {isLoading
            ? 'Carregando atividade…'
            : 'Nenhuma atividade registrada neste modo.'}
        </p>
      )}

      {insights && <AntiInsights {...insights} />}
    </article>
  );
}
