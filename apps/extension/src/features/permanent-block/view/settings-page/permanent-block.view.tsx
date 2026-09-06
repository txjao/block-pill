import type { usePermanentBlockModel } from './permanent-block.model';
import { Button } from '@/shared/ui/components/button';
import blockPillIcon from '@workspace/shared/brand/icons/block-pill-transparent.svg?url';
import styles from './permanent-block.module.css';

type PermanentBlockModel = ReturnType<typeof usePermanentBlockModel>;
const documentationUrl =
  'https://github.com/txjao/block-pill/blob/main/docs/BLOCKING_RULES.md#bloqueio-permanente';

export function PermanentBlockView(props: PermanentBlockModel) {
  const {
    blocks,
    hostname,
    acknowledged,
    feedback,
    isLoading,
    setHostname,
    setAcknowledged,
    addBlock,
  } = props;

  return (
    <section class={styles.section} aria-labelledby="permanent-title">
      <h2 id="permanent-title" class={styles.srOnly}>
        Decisões permanentes
      </h2>

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

      <form class={styles.formCard} onSubmit={(event) => void addBlock(event)}>
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
        <label class={styles.acknowledgement}>
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(event) => setAcknowledged(event.currentTarget.checked)}
          />
          <span>
            Entendo que este bloqueio não pode ser desfeito por este painel.
          </span>
        </label>
        <Button
          variant="dark"
          type="submit"
          loading={isLoading}
          disabled={!acknowledged}
        >
          Bloquear em definitivo
        </Button>
        <small>
          Use para o que você já decidiu que não volta a negociar.{' '}
          <a href={documentationUrl} target="_blank" rel="noreferrer">
            Entenda os detalhes.
          </a>
        </small>
      </form>

      {feedback && (
        <p class={styles.feedback} role="status">
          {feedback}
        </p>
      )}
    </section>
  );
}
