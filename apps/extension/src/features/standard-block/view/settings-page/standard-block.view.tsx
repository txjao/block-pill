import type { StandardBlockModel } from './standard-block.model';
import { Button } from '@/shared/ui/components/button';
import blockPillIcon from '@workspace/shared/brand/icons/block-pill-transparent.svg?url';
import styles from './standard-block.module.css';
import { StandardBlockList } from './components/standard-block-list';

export function StandardBlockView(props: StandardBlockModel) {
  const {
    blocks,
    hostname,
    feedback,
    isLoading,
    globalCooldownHours,
    setHostname,
    setGlobalCooldownHours,
    addBlock,
    saveGlobalCooldown,
  } = props;

  return (
    <section class={styles.section} aria-labelledby="standard-blocks-title">
      <h2 id="standard-blocks-title" class={styles.srOnly}>
        Pausas flexíveis
      </h2>

      {blocks.length === 0 ? (
        <div class={styles.emptyState}>
          <img src={blockPillIcon} alt="" />
          <h3>Nenhum site em pausa ainda</h3>
          <p>
            Comece pelo site em que você mais se perde. Dá para mudar ou remover
            quando quiser.
          </p>
          <small>
            Se a decisão não deve ser desfeita, use a aba Decisões permanentes.
          </small>
        </div>
      ) : (
        <StandardBlockList {...props} />
      )}

      <div class={styles.formCard}>
        <header>
          <h3>Novo bloqueio flexível</h3>
          <p>Você poderá liberar 15 minutos por ciclo quando precisar.</p>
        </header>
        <form class={styles.form} onSubmit={(event) => void addBlock(event)}>
          <label for="hostname">Endereço</label>
          <input
            id="hostname"
            name="hostname"
            type="text"
            inputMode="url"
            placeholder="exemplo.com"
            value={hostname}
            onInput={(event) => setHostname(event.currentTarget.value)}
            disabled={isLoading}
            required
          />
          <Button type="submit" loading={isLoading}>
            Criar bloqueio
          </Button>
        </form>
        <form
          class={styles.cooldownForm}
          onSubmit={(event) => void saveGlobalCooldown(event)}
        >
          <label for="global-cooldown">Espera entre liberações</label>
          <div>
            <input
              id="global-cooldown"
              type="number"
              min="1"
              max="17568"
              step="0.5"
              value={globalCooldownHours}
              onInput={(event) =>
                setGlobalCooldownHours(event.currentTarget.value)
              }
              required
            />
            <span>horas</span>
            <Button variant="secondary" type="submit" disabled={isLoading}>
              Salvar espera
            </Button>
          </div>
        </form>
        <small class={styles.suggestions}>
          Sugestões: youtube.com · instagram.com · tiktok.com
        </small>
      </div>

      <p class={styles.feedback} aria-live="polite">
        {feedback}
      </p>
    </section>
  );
}
