import type { ActivityDashboardModel } from '@/features/activity/view/dashboard-page/activity-dashboard.model';
import { Button } from '@/shared/ui/components/button';
import styles from '@/features/activity/view/dashboard-page/activity-dashboard.module.css';

type DeletionDialogProps = Pick<
  ActivityDashboardModel,
  | 'deletionTarget'
  | 'deletionConfirmed'
  | 'isLoading'
  | 'setDeletionTarget'
  | 'setDeletionConfirmed'
  | 'confirmDeletion'
>;

export function ActivityDeletionDialog(props: DeletionDialogProps) {
  const {
    deletionTarget,
    deletionConfirmed,
    isLoading,
    setDeletionTarget,
    setDeletionConfirmed,
    confirmDeletion,
  } = props;

  if (!deletionTarget) return null;

  return (
    <div
      class={styles.dialog}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-title"
    >
      <span class={styles.dialogKicker}>Dados locais</span>
      <h2 id="delete-title">Excluir {deletionTarget.label}?</h2>
      <p>
        Reflexões e métricas selecionadas serão apagadas. As regras de bloqueio
        continuarão ativas.
      </p>
      <label class={styles.confirmation}>
        <input
          type="checkbox"
          checked={deletionConfirmed}
          onChange={(event) =>
            setDeletionConfirmed(event.currentTarget.checked)
          }
        />
        Entendo que estes dados não poderão ser recuperados.
      </label>
      <div class={styles.dialogActions}>
        <Button
          variant="secondary"
          type="button"
          onClick={() => setDeletionTarget(undefined)}
        >
          Manter dados
        </Button>
        <Button
          variant="destructive"
          type="button"
          disabled={!deletionConfirmed || isLoading}
          onClick={() => void confirmDeletion()}
        >
          Excluir dados
        </Button>
      </div>
    </div>
  );
}
