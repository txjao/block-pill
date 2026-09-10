import * as Dialog from 'radix-ui/dialog';
import { Button } from '@/shared/ui/components/button';
import type { StandardBlockModel } from '@/features/standard-block/view/settings-page/standard-block.model';
import dialogStyles from '@/shared/ui/components/alert-dialog/alert-dialog.module.css';
import styles from '@/features/standard-block/view/settings-page/standard-block.module.css';

type Props = Pick<
  StandardBlockModel,
  | 'editingBlock'
  | 'domainSettingsFeedback'
  | 'isLoading'
  | 'closeDomainSettings'
  | 'saveDomainCooldown'
>;

export function StandardBlockDomainSettingsDialog({
  editingBlock,
  domainSettingsFeedback,
  isLoading,
  closeDomainSettings,
  saveDomainCooldown,
}: Props) {
  if (!editingBlock) return null;

  return (
    <Dialog.Root open onOpenChange={(open) => !open && closeDomainSettings()}>
      <Dialog.Portal>
        <Dialog.Overlay className={dialogStyles.overlay} />
        <Dialog.Content className={dialogStyles.content}>
          <Dialog.Title className={dialogStyles.title}>
            Editar espera de {editingBlock.hostname}
          </Dialog.Title>
          <Dialog.Description className={dialogStyles.description}>
            Defina um tempo próprio para este site ou deixe o campo vazio para
            usar a espera geral.
          </Dialog.Description>
          <form
            class={styles.domainDialogForm}
            onSubmit={(event) => void saveDomainCooldown(event)}
          >
            <label for={`cooldown-${editingBlock.ruleId}`}>
              Tempo de espera, em horas
            </label>
            <input
              id={`cooldown-${editingBlock.ruleId}`}
              name="cooldownHours"
              type="number"
              min="1"
              max="17568"
              step="0.5"
              placeholder="Usar espera geral"
              defaultValue={
                editingBlock.cooldownMilliseconds
                  ? editingBlock.cooldownMilliseconds / 3_600_000
                  : ''
              }
            />
            <p class={styles.domainDialogFeedback} role="status">
              {domainSettingsFeedback}
            </p>
            <div class={dialogStyles.actions}>
              <Dialog.Close asChild>
                <Button variant="secondary" type="button">
                  Cancelar
                </Button>
              </Dialog.Close>
              <Button type="submit" loading={isLoading}>
                Salvar
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
