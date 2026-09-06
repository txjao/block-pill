import type { ActivitySource } from '@/features/activity/domain/activity.types';
import { Badge } from '@/shared/ui/components/badge';
import { Button } from '@/shared/ui/components/button';
import type { ActivityDashboardModel } from '@/features/activity/view/dashboard-page/activity-dashboard.model';
import { createModeMetrics } from '@/features/activity/view/dashboard-page/activity-dashboard.presentation';
import styles from '@/features/activity/view/dashboard-page/activity-dashboard.module.css';
import { AntiInsights } from './anti-insights';

type ActivityModeCardProps = Pick<
  ActivityDashboardModel,
  'events' | 'summaries' | 'isLoading' | 'requestDeletion'
> & { source: ActivitySource };

export function ActivityModeCard(props: ActivityModeCardProps) {
  const { source, events, summaries, isLoading, requestDeletion } = props;
  const modeSummaries = summaries.filter((item) => item.source === source);
  const modeEvents = events.filter((item) => item.source === source);
  const metrics = createModeMetrics(modeSummaries);

  return (
    <article class={styles.modeCard}>
      <header>
        <div>
          <Badge variant={source.startsWith('anti') ? 'accent' : 'neutral'}>
            {sourceLabel(source)}
          </Badge>
          <h3>{modeTitle(source)}</h3>
          <p>{modeDescription(source)}</p>
        </div>
        {modeEvents.length > 0 && (
          <Button
            className={styles.dangerText}
            variant="text"
            type="button"
            onClick={() =>
              requestDeletion({ label: `todos os registros de ${sourceLabel(source)}`, source })
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

      {modeSummaries.length ? (
        <ul class={styles.domainList}>
          {modeSummaries.map((summary) => (
            <li key={summary.key}>
              <div>
                <strong>{summary.hostname}</strong>
                <small>Última tentativa: {formatDate(summary.lastAttemptAt)}</small>
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
                    label: `${sourceLabel(summary.source)} em ${summary.hostname}`,
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
          {isLoading ? 'Carregando atividade…' : 'Nenhuma atividade registrada neste modo.'}
        </p>
      )}

      {source.startsWith('anti') && <AntiInsights events={modeEvents} summaries={modeSummaries} />}
    </article>
  );
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
    standard: 'Veja onde uma pequena fricção ajudou a interromper o automático.',
    permanent: 'Acompanhe as tentativas barradas pelas decisões que você tornou definitivas.',
    'anti-porn': 'Observe gatilhos e sentimentos sem julgamento para reconhecer padrões.',
    'anti-bet': 'Entenda momentos de impulso e preserve distância de decisões financeiras rápidas.',
  }[source];
}

function formatDate(value?: number) {
  return value
    ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(value)
    : 'Sem registro';
}
