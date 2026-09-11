import type { usePermanentBlockModel } from './permanent-block.model';
import { AlertDialog } from '@/shared/ui/components/alert-dialog';
import { Button } from '@/shared/ui/components/button';
import { TextLink } from '@/shared/ui/components/text-link';
import blockPillIcon from '@workspace/shared/brand/icons/block-pill-transparent.svg?url';
import styles from './permanent-block.module.css';

type PermanentBlockModel = ReturnType<typeof usePermanentBlockModel>;

export function PermanentBlockView(props: PermanentBlockModel) {
  const {
    documentationUrl,
    blocks,
    hostname,
    confirmationOpen,
    feedback,
    isLoading,
    highlightedHostname,
    setHostname,
    setConfirmationOpen,
    submitBlock,
    createBlock,
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
        <Button variant="bright" type="submit" loading={isLoading}>
          Bloquear em definitivo
        </Button>
        <small>
          Use para o que você já decidiu que não volta a negociar.{' '}
          <TextLink href={documentationUrl} target="_blank" rel="noreferrer">
            Entenda os detalhes.
          </TextLink>
        </small>
      </form>

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
            <li
              class={
                block.hostname === highlightedHostname
                  ? styles.recentlyAdded
                  : undefined
              }
              key={block.hostname}
            >
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
