import { StandardBlockSettingsDialog } from './components/standard-block-settings-dialog';
import * as Dialog from 'radix-ui/dialog';
import type { StandardBlockModel } from './standard-block.model';
import { Button } from '@/shared/ui/components/button';
import { SettingsIcon } from '@/shared/ui/components/settings-icon';
import blockPillIcon from '@workspace/shared/brand/icons/block-pill-transparent.svg?url';
import styles from './standard-block.module.css';
import { StandardBlockList } from './components/standard-block-list';

export function StandardBlockView(props: StandardBlockModel) {
  const {
    blocks,
    hostname,
    feedback,
    isLoading,
    setHostname,
    addBlock,
    settingsOpen,
    setSettingsOpen,
  } = props;

  return (
    <Dialog.Root open={settingsOpen} onOpenChange={setSettingsOpen}>
      <section class={styles.section} aria-labelledby="standard-blocks-title">
        <h2 id="standard-blocks-title" class={styles.srOnly}>
          Pausas flexíveis
        </h2>

        <div class={styles.formCard}>
          <header>
            <div>
              <h3>Novo bloqueio flexível</h3>
              <p>Você poderá liberar 15 minutos por ciclo quando precisar.</p>
            </div>
            <Dialog.Trigger asChild>
              <Button
                variant="secondary"
                type="button"
                className={styles.settingsButton}
                aria-label="Configurar tempo de espera"
                title="Configurar tempo de espera"
                aria-haspopup="dialog"
                aria-expanded={settingsOpen}
              >
                <SettingsIcon />
              </Button>
            </Dialog.Trigger>
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
            <Button
              variant="bright"
              className={styles.createButton}
              type="submit"
              loading={isLoading}
            >
              Criar bloqueio
            </Button>
          </form>
          <StandardBlockSettingsDialog {...props} />
          <small class={styles.suggestions}>
            Sugestões: youtube.com · instagram.com · tiktok.com
          </small>
        </div>

        {blocks.length === 0 ? (
          <div class={styles.emptyState}>
            <img src={blockPillIcon} alt="" />
            <h3>Nenhum site em pausa ainda</h3>
            <p>
              Comece pelo site em que você mais se perde. Dá para mudar ou
              remover quando quiser.
            </p>
            <small>
              Se a decisão não deve ser desfeita, use a aba Decisões
              permanentes.
            </small>
          </div>
        ) : (
          <StandardBlockList {...props} />
        )}

        <p class={styles.feedback} aria-live="polite">
          {feedback}
        </p>
      </section>
    </Dialog.Root>
  );
}
