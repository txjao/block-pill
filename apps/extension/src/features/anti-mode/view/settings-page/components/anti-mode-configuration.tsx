import type {
  AntiModeConfig,
  AntiDurationUnit,
  AntiModeId,
} from '@/features/anti-mode/domain/anti-mode.types';
import * as Select from 'radix-ui/select';
import { Toggle } from '@/shared/ui/components/toggle';
import { Button } from '@/shared/ui/components/button';
import type { AntiModeModel } from '@/features/anti-mode/view/settings-page/anti-mode.model';
import styles from '@/features/anti-mode/view/settings-page/anti-mode.module.css';

type ConfigurationProps = Pick<
  AntiModeModel,
  | 'canImportProfile'
  | 'commitmentLabel'
  | 'draft'
  | 'updateDraft'
  | 'activate'
  | 'isLoading'
  | 'incognitoAllowed'
> & {
  mode: AntiModeId;
  config?: AntiModeConfig;
  active: boolean;
};

export function AntiModeConfiguration(props: ConfigurationProps) {
  const {
    mode,
    config,
    active,
    canImportProfile,
    commitmentLabel,
    draft,
    updateDraft,
    activate,
    isLoading,
    incognitoAllowed,
  } = props;

  if (active && config) {
    return (
      <div class={styles.activeCommitment}>
        <strong>{commitmentLabel}</strong>
        <p>
          {config.goals.length
            ? `Você escolheu este modo por: ${config.goals.join(', ')}`
            : 'Seu compromisso está ativo.'}
        </p>
      </div>
    );
  }

  return (
    <form
      class={styles.configuration}
      onSubmit={(event) => {
        event.preventDefault();
        void activate(mode);
      }}
    >
      <header>
        <strong>Configurar este modo</strong>
        <small>Revise seu compromisso antes de ativar</small>
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
              required={!draft.permanent}
              value={draft.durationValue}
              disabled={draft.permanent}
              onInput={(event) =>
                updateDraft(mode, 'durationValue', event.currentTarget.value)
              }
            />
            <Select.Root
              value={draft.durationUnit}
              disabled={draft.permanent}
              onValueChange={(value) =>
                updateDraft(mode, 'durationUnit', value as AntiDurationUnit)
              }
            >
              <Select.Trigger
                className={styles.durationSelect}
                aria-label="Unidade da duração"
              >
                <Select.Value />
                <Select.Icon className={styles.durationSelectIcon}>
                  <ChevronDownIcon />
                </Select.Icon>
              </Select.Trigger>
              <Select.Portal>
                <Select.Content
                  className={styles.durationSelectContent}
                  position="popper"
                  sideOffset={6}
                >
                  <Select.Viewport className={styles.durationSelectViewport}>
                    <DurationOption value="days">dias</DurationOption>
                    <DurationOption value="months">meses</DurationOption>
                    <DurationOption value="years">anos</DurationOption>
                  </Select.Viewport>
                </Select.Content>
              </Select.Portal>
            </Select.Root>
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
        {canImportProfile && (
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
      <div class={styles.activationActions}>
        <Button type="submit" loading={isLoading} disabled={!incognitoAllowed}>
          Ativar proteção
        </Button>
        <small>
          Depois de ativar, aguarde o prazo escolhido para desativar.
        </small>
      </div>
    </form>
  );
}

function DurationOption({
  value,
  children,
}: {
  value: AntiDurationUnit;
  children: string;
}) {
  return (
    <Select.Item className={styles.durationSelectItem} value={value}>
      <Select.ItemText>{children}</Select.ItemText>
      <Select.ItemIndicator className={styles.durationSelectIndicator}>
        <CheckIcon />
      </Select.ItemIndicator>
    </Select.Item>
  );
}

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
      <path
        d="m4 6 4 4 4-4"
        fill="none"
        stroke="currentColor"
        stroke-width="1.75"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true">
      <path
        d="m3.5 8 3 3 6-6"
        fill="none"
        stroke="currentColor"
        stroke-width="1.75"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
}
