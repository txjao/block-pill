import { Button } from '@/shared/ui/components/button';
import type { StandardBlockModel } from '@/features/standard-block/view/settings-page/standard-block.model';
import styles from '@/features/standard-block/view/settings-page/standard-block.module.css';
import { StandardBlockDomainSettingsDialog } from './standard-block-domain-settings-dialog';

type StandardBlockListProps = Pick<
  StandardBlockModel,
  | 'blockRows'
  | 'isLoading'
  | 'removeBlock'
  | 'openDomainSettings'
  | 'closeDomainSettings'
  | 'editingBlock'
  | 'domainSettingsFeedback'
  | 'saveDomainCooldown'
  | 'highlightedHostname'
>;

export function StandardBlockList(props: StandardBlockListProps) {
  const {
    blockRows,
    highlightedHostname,
    isLoading,
    removeBlock,
    openDomainSettings,
  } = props;

  return (
    <>
      <ul class={styles.list}>
        {blockRows.map(({ block, cooldownLabel }) => (
          <li
            class={
              block.hostname === highlightedHostname
                ? styles.recentlyAdded
                : undefined
            }
            key={block.hostname}
          >
            <span>
              <strong>{block.hostname}</strong>
              <small>{cooldownLabel}</small>
            </span>
            <div class={styles.listActions}>
              <Button
                variant="text"
                disabled={isLoading}
                onClick={() => openDomainSettings(block)}
              >
                Editar
              </Button>
              <Button
                variant="text"
                disabled={isLoading}
                onClick={() => void removeBlock(block)}
              >
                Remover
              </Button>
            </div>
          </li>
        ))}
      </ul>
      <StandardBlockDomainSettingsDialog {...props} />
    </>
  );
}
