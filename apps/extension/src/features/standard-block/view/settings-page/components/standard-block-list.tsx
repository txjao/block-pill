import { Button } from '@/shared/ui/components/button';
import type { StandardBlockModel } from '@/features/standard-block/view/settings-page/standard-block.model';
import styles from '@/features/standard-block/view/settings-page/standard-block.module.css';

type StandardBlockListProps = Pick<
  StandardBlockModel,
  'blockRows' | 'isLoading' | 'removeBlock' | 'saveDomainCooldown'
>;

export function StandardBlockList(props: StandardBlockListProps) {
  const { blockRows, isLoading, removeBlock, saveDomainCooldown } = props;

  return (
    <ul class={styles.list}>
      {blockRows.map(({ block, cooldownLabel }) => (
        <li key={block.hostname}>
          <div class={styles.listRow}>
            <span>
              <strong>{block.hostname}</strong>
              <small>{cooldownLabel}</small>
            </span>
            <Button
              variant="text"
              disabled={isLoading}
              onClick={() => void removeBlock(block)}
            >
              Remover
            </Button>
          </div>
          <details class={styles.domainSettings}>
            <summary>Ajustar espera deste site</summary>
            <form onSubmit={(event) => void saveDomainCooldown(block, event)}>
              <label class={styles.srOnly} for={`cooldown-${block.ruleId}`}>
                Espera específica para {block.hostname}
              </label>
              <input
                id={`cooldown-${block.ruleId}`}
                name="cooldownHours"
                type="number"
                min="1"
                max="17568"
                step="0.5"
                placeholder="Usar geral"
                defaultValue={
                  block.cooldownMilliseconds
                    ? block.cooldownMilliseconds / 3_600_000
                    : ''
                }
              />
              <Button variant="secondary" type="submit" disabled={isLoading}>
                Aplicar espera própria
              </Button>
            </form>
            <small>Deixe vazio para voltar a usar a espera geral.</small>
          </details>
        </li>
      ))}
    </ul>
  );
}
