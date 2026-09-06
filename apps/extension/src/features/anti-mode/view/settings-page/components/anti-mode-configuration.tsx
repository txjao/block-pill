import type {
  AntiModeConfig,
  AntiModeId,
} from '@/features/anti-mode/domain/anti-mode.types';
import { Toggle } from '@/shared/ui/components/toggle';
import type { AntiModeModel } from '@/features/anti-mode/view/settings-page/anti-mode.model';
import styles from '@/features/anti-mode/view/settings-page/anti-mode.module.css';
import { formatCommitmentLabel } from '@/features/anti-mode/view/anti-mode.presentation';

type ConfigurationProps = Pick<
  AntiModeModel,
  'configs' | 'drafts' | 'updateDraft'
> & {
  mode: AntiModeId;
  config?: AntiModeConfig;
  active: boolean;
};

export function AntiModeConfiguration(props: ConfigurationProps) {
  const { mode, config, active, configs, drafts, updateDraft } = props;
  const draft = drafts[mode];

  if (active && config) {
    return (
      <div class={styles.activeCommitment}>
        <strong>{formatCommitmentLabel(config)}</strong>
        <p>
          {config.goals.length
            ? `Você escolheu este modo por: ${config.goals.join(', ')}`
            : 'Seu compromisso está ativo.'}
        </p>
      </div>
    );
  }

  return (
    <div class={styles.configuration}>
      <header>
        <strong>Configurar este modo</strong>
        <small>Passo 1 de 2 · revise antes de ativar</small>
      </header>
      <div class={styles.formGrid}>
        <div class={styles.fieldGroup}>
          <label for={`${mode}-duration`}>Duração do compromisso</label>
          <p>
            Durante esse período o modo não poderá ser desligado por impulso.
          </p>
          <div class={styles.durationRow}>
            <input
              id={`${mode}-duration`}
              type="number"
              min="1"
              value={draft.durationValue}
              disabled={draft.permanent}
              onInput={(event) =>
                updateDraft(mode, 'durationValue', event.currentTarget.value)
              }
            />
            <select
              value={draft.durationUnit}
              disabled={draft.permanent}
              onChange={(event) =>
                updateDraft(
                  mode,
                  'durationUnit',
                  event.currentTarget.value as 'days' | 'months' | 'years',
                )
              }
            >
              <option value="days">dias</option>
              <option value="months">meses</option>
              <option value="years">anos</option>
            </select>
          </div>
        </div>
        <Toggle
          checked={draft.permanent}
          label="Compromisso sem prazo"
          description="A configuração não poderá ser removida pelo painel."
          onCheckedChange={(checked) => updateDraft(mode, 'permanent', checked)}
        />
        <label class={styles.fieldGroup}>
          <span>
            Por que isso importa para você? <small>opcional</small>
          </span>
          <textarea
            value={draft.goals}
            onInput={(event) =>
              updateDraft(mode, 'goals', event.currentTarget.value)
            }
            placeholder="Relacionamentos, presença, tranquilidade, planos…"
          />
        </label>
        <label class={styles.fieldGroup}>
          <span>
            Alternativas que fazem bem <small>opcional</small>
          </span>
          <textarea
            value={draft.hobbies}
            onInput={(event) =>
              updateDraft(mode, 'hobbies', event.currentTarget.value)
            }
            placeholder="Caminhar, ler, cozinhar, conversar, treinar…"
          />
        </label>
        <label class={styles.checkbox}>
          <input
            type="checkbox"
            checked={draft.philosophicalKnowledge}
            onChange={(event) =>
              updateDraft(
                mode,
                'philosophicalKnowledge',
                event.currentTarget.checked,
              )
            }
          />
          Mostrar reflexões filosóficas nos momentos de pausa
        </label>
        {configs.some(
          (item) =>
            item.id !== mode && (item.goals.length || item.hobbies.length),
        ) && (
          <label class={styles.checkbox}>
            <input
              type="checkbox"
              checked={draft.importProfile}
              onChange={(event) =>
                updateDraft(mode, 'importProfile', event.currentTarget.checked)
              }
            />
            Reutilizar objetivos e alternativas do outro modo
          </label>
        )}
      </div>
    </div>
  );
}
