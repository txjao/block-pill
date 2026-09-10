import * as Dialog from 'radix-ui/dialog';
import { Button } from '@/shared/ui/components/button';
import type { StandardBlockModel } from '@/features/standard-block/view/settings-page/standard-block.model';
import dialogStyles from '@/shared/ui/components/alert-dialog/alert-dialog.module.css';
import styles from '@/features/standard-block/view/settings-page/standard-block.module.css';

type Props = Pick<
  StandardBlockModel,
  | 'globalCooldownHours'
  | 'setGlobalCooldownHours'
  | 'saveGlobalCooldown'
  | 'isLoading'
  | 'settingsFeedback'
>;

export function StandardBlockSettingsDialog({
  globalCooldownHours,
  setGlobalCooldownHours,
  saveGlobalCooldown,
  isLoading,
  settingsFeedback,
}: Props) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className={dialogStyles.overlay} />
      <Dialog.Content className={dialogStyles.content}>
        <Dialog.Title className={dialogStyles.title}>
          Tempo de espera
        </Dialog.Title>
        <Dialog.Description className={dialogStyles.description}>
          Defina quanto esperar por um novo ciclo depois de usar os 15 minutos
          disponíveis.
        </Dialog.Description>
        <form
          class={styles.cooldownForm}
          onSubmit={(event) => void saveGlobalCooldown(event)}
        >
          <label for="global-cooldown">Espera padrão, em horas</label>
          <div>
            <input
              id="global-cooldown"
              type="number"
              min="1"
              max="17568"
              step="0.5"
              value={globalCooldownHours}
              required
              onInput={(event) =>
                setGlobalCooldownHours(event.currentTarget.value)
              }
            />
            <Button type="submit" loading={isLoading}>
              Salvar
            </Button>
          </div>
        </form>
        <p role="status">{settingsFeedback}</p>
        <Dialog.Close asChild>
          <Button variant="text">Fechar</Button>
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  );
}
