import { Badge } from '@/shared/ui/components/badge';
import { Button } from '@/shared/ui/components/button';
import { Tabs, TabsContent } from '@/shared/ui/components/tabs';
import type { ActivityDashboardModel } from './activity-dashboard.model';
import styles from './activity-dashboard.module.css';
import { ActivityDeletionDialog } from './components/activity-deletion-dialog';
import { ActivityModeCard } from './components/activity-mode-card';

export function ActivityDashboardView(props: ActivityDashboardModel) {
  const {
    events,
    feedback,
    isLoading,
    modes,
    requestDeletion,
    selectedSource,
    setSelectedSource,
    modeTabs,
  } = props;

  return (
    <section aria-labelledby="dashboard-title">
      <div class={styles.pageHeader}>
        <div>
          <Badge variant="accent">Somente neste navegador</Badge>
          <h2 id="dashboard-title">Atividade por modo</h2>
          <p>
            Cada proteção tem seu próprio contexto. Os registros abaixo nunca
            saem do seu dispositivo.
          </p>
        </div>
      </div>

      <Tabs
        value={selectedSource}
        onValueChange={setSelectedSource}
        items={modeTabs}
      >
        {modes.map((mode) => (
          <TabsContent key={mode.source} value={mode.source}>
            <ActivityModeCard
              key={mode.source}
              isLoading={isLoading}
              mode={mode}
              requestDeletion={requestDeletion}
            />
          </TabsContent>
        ))}
      </Tabs>

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
