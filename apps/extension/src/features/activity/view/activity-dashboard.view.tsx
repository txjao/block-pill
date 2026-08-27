import type { ActivitySource } from '../domain/activity.types';
import type { useActivityDashboardModel } from './activity-dashboard.model';
import { Badge } from '../../../shared/ui/badge';

type ActivityDashboardModel = ReturnType<typeof useActivityDashboardModel>;
const sources: ActivitySource[] = ['standard', 'permanent', 'anti-porn', 'anti-bet'];

export function ActivityDashboardView(props: ActivityDashboardModel) {
  const {
    summaries,
    events,
    feedback,
    isLoading,
    deletionTarget,
    deletionConfirmed,
    requestDeletion,
    setDeletionTarget,
    setDeletionConfirmed,
    confirmDeletion,
  } = props;

  return (
    <section class="activity-page" aria-labelledby="dashboard-title">
      <div class="section-heading">
        <div>
          <Badge tone="accent">Somente neste navegador</Badge>
          <h2 id="dashboard-title">Atividade por modo</h2>
          <p>
            Cada proteção tem seu próprio contexto. Os registros abaixo nunca saem do seu
            dispositivo.
          </p>
        </div>
      </div>

      <div class="dashboard-mode-stack">
        {sources.map((source) => {
          const modeSummaries = summaries.filter((item) => item.source === source);
          const modeEvents = events.filter((item) => item.source === source);
          const attempts = modeSummaries.reduce((total, item) => total + item.attempts, 0);
          const grants = modeSummaries.reduce((total, item) => total + item.grants, 0);
          return (
            <article class="mode-dashboard" key={source}>
              <header>
                <div>
                  <Badge tone={source.startsWith('anti') ? 'accent' : 'neutral'}>
                    {sourceLabel(source)}
                  </Badge>
                  <h3>{modeTitle(source)}</h3>
                  <p>{modeDescription(source)}</p>
                </div>
                {modeEvents.length > 0 && (
                  <button
                    class="text-button danger-text"
                    type="button"
                    onClick={() =>
                      requestDeletion({
                        label: `todos os registros de ${sourceLabel(source)}`,
                        source,
                      })
                    }
                  >
                    Limpar registros
                  </button>
                )}
              </header>
              <div class="metric-row">
                <div>
                  <strong>{attempts}</strong>
                  <span>Tentativas interrompidas</span>
                </div>
                <div>
                  <strong>{grants}</strong>
                  <span>Acessos temporários</span>
                </div>
                <div>
                  <strong>{modeSummaries.length}</strong>
                  <span>Sites registrados</span>
                </div>
              </div>

              {modeSummaries.length ? (
                <ul class="activity-domain-list">
                  {modeSummaries.map((summary) => (
                    <li key={summary.key}>
                      <div>
                        <strong>{summary.hostname}</strong>
                        <small>Última tentativa: {formatDate(summary.lastAttemptAt)}</small>
                      </div>
                      <div class="domain-metrics">
                        <span>{summary.attempts} tentativas</span>
                        {summary.grants > 0 && <span>{summary.grants} liberações</span>}
                      </div>
                      <button
                        class="text-button"
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
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p class="empty-state">
                  {isLoading ? 'Carregando atividade…' : 'Nenhuma atividade registrada neste modo.'}
                </p>
              )}

              {source.startsWith('anti') && (
                <AntiInsights events={modeEvents} summaries={modeSummaries} />
              )}
            </article>
          );
        })}
      </div>

      {events.length > 0 && (
        <button
          class="secondary-button clear-all"
          type="button"
          onClick={() => requestDeletion({ label: 'todo o histórico local' })}
        >
          Excluir todo o histórico local
        </button>
      )}

      {deletionTarget && (
        <div class="friction-dialog" role="dialog" aria-modal="true" aria-labelledby="delete-title">
          <span class="dialog-kicker">Dados locais</span>
          <h2 id="delete-title">Excluir {deletionTarget.label}?</h2>
          <p>
            Reflexões e métricas selecionadas serão apagadas. As regras de bloqueio continuarão
            ativas.
          </p>
          <label class="confirm-check">
            <input
              type="checkbox"
              checked={deletionConfirmed}
              onChange={(event) => setDeletionConfirmed(event.currentTarget.checked)}
            />
            Entendo que estes dados não poderão ser recuperados.
          </label>
          <div class="dialog-actions">
            <button
              class="secondary-button"
              type="button"
              onClick={() => setDeletionTarget(undefined)}
            >
              Manter dados
            </button>
            <button
              class="danger-button"
              type="button"
              disabled={!deletionConfirmed || isLoading}
              onClick={() => void confirmDeletion()}
            >
              Excluir dados
            </button>
          </div>
        </div>
      )}
      {feedback && <p role="status">{feedback}</p>}
    </section>
  );
}

function AntiInsights({
  events,
  summaries,
}: {
  events: ActivityDashboardModel['events'];
  summaries: ActivityDashboardModel['summaries'];
}) {
  const feelings = new Map<string, number>();
  summaries.forEach((summary) =>
    summary.feelings.forEach((item) =>
      feelings.set(item.feeling, (feelings.get(item.feeling) ?? 0) + item.count),
    ),
  );
  const common = [...feelings.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
  const reflections = events
    .filter((event) => event.kind === 'reflection')
    .slice()
    .reverse()
    .slice(0, 3);
  return (
    <div class="anti-insights">
      <div>
        <h4>Emoções mais percebidas</h4>
        {common.length ? (
          <div class="feeling-summary">
            {common.map(([feeling, count]) => (
              <Badge key={feeling} tone="accent">
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
          <ul class="reflection-list">
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

function sourceLabel(source: string) {
  return (
    (
      {
        standard: 'Padrão',
        permanent: 'Permanente',
        'anti-porn': 'Anti-pornografia',
        'anti-bet': 'Anti-aposta',
      } as Record<string, string>
    )[source] ?? source
  );
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
