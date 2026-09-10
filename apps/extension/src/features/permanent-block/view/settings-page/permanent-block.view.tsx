import type { usePermanentBlockModel } from './permanent-block.model';
import { AlertDialog } from '@/shared/ui/components/alert-dialog';
import { Button } from '@/shared/ui/components/button';
import { Toggle } from '@/shared/ui/components/toggle';
import blockPillIcon from '@workspace/shared/brand/icons/block-pill-transparent.svg?url';
import styles from './permanent-block.module.css';

type PermanentBlockModel = ReturnType<typeof usePermanentBlockModel>;

export function PermanentBlockView(props: PermanentBlockModel) {
  const {
    documentationUrl,
    blocks,
    hostname,
    confirmationEnabled,
    confirmationLoading,
    confirmationOpen,
    feedback,
    isLoading,
    setHostname,
    setConfirmationOpen,
    submitBlock,
    createBlock,
    changeConfirmationEnabled,
  } = props;

  return (
    <section class={styles.section} aria-labelledby="permanent-title">
      <h2 id="permanent-title" class={styles.srOnly}>
        Decisões permanentes
      </h2>

      <form class={styles.formCard} onSubmit={submitBlock}>
        <header>
          <h3>Novo bloqueio permanente</h3>
          <p>
            Não há liberação por minutos. Só sai daqui reinstalando a extensão.
          </p>
        </header>
        <label class={styles.fieldLabel} for="permanent-hostname">
          Endereço
        </label>
        <input
          id="permanent-hostname"
          inputMode="url"
          placeholder="exemplo.com"
          value={hostname}
          onInput={(event) => setHostname(event.currentTarget.value)}
          disabled={isLoading}
          required
        />
        <Button variant="primary" type="submit" loading={isLoading}>
          Bloquear em definitivo
        </Button>
        <small>
          Use para o que você já decidiu que não volta a negociar.{' '}
          <a href={documentationUrl} target="_blank" rel="noreferrer">
            Entenda os detalhes.
          </a>
        </small>
      </form>

      <div class={styles.confirmationPreference}>
        <Toggle
          label="Confirmar bloqueios permanentes"
          description="Mostra uma revisão final antes de criar o bloqueio."
          checked={confirmationEnabled}
          disabled={confirmationLoading}
          onCheckedChange={(enabled) => void changeConfirmationEnabled(enabled)}
        />
      </div>

      {blocks.length === 0 ? (
        <div class={styles.emptyState}>
          <img src={blockPillIcon} alt="" />
          <h3>Nenhum bloqueio permanente ainda</h3>
          <p>
            Reserve esta lista para o que você já decidiu. Depois de criado, não
            sai por este painel.
          </p>
          <small>Para uma decisão ajustável, use a aba Pausas flexíveis.</small>
        </div>
      ) : (
        <ul class={styles.list}>
          {blocks.map((block) => (
            <li key={block.hostname}>
              <strong>{block.hostname}</strong>
              <small>decisão permanente</small>
            </li>
          ))}
        </ul>
      )}

      {feedback && (
        <p class={styles.feedback} role="status">
          {feedback}
        </p>
      )}

      <AlertDialog
        open={confirmationOpen}
        title={`Bloquear ${hostname.trim()} em definitivo?`}
        description="Este bloqueio não poderá ser removido por este painel. Para desfazer, será necessário reinstalar a extensão."
        cancelLabel="Voltar"
        confirmLabel="Bloquear em definitivo"
        loading={isLoading}
        variant="primary"
        onOpenChange={setConfirmationOpen}
        onConfirm={() => void createBlock()}
      />
    </section>
  );
}
