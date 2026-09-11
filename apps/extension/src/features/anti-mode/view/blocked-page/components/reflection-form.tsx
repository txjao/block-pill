import type { AntiModeBlockedModel } from '@/features/anti-mode/view/blocked-page/anti-mode.blocked-model';
import { InteractiveHoverButton } from '@/shared/ui/components/interactive-hover-button';
import styles from '@/features/anti-mode/view/blocked-page/anti-mode.blocked.module.css';

type ReflectionFormProps = Pick<
  AntiModeBlockedModel,
  'feelings' | 'reason' | 'setReason' | 'toggleFeeling' | 'saveReflection'
> & {
  feelingOptions: readonly (readonly [string, string])[];
};

export function ReflectionForm(props: ReflectionFormProps) {
  const {
    feelingOptions,
    feelings,
    reason,
    setReason,
    toggleFeeling,
    saveReflection,
  } = props;

  return (
    <div class={styles.reflectionForm}>
      <h2>Como você está se sentindo?</h2>
      <p>
        Registrar é opcional e ajuda você a reconhecer padrões. Os dados ficam
        neste navegador.
      </p>
      <div class={styles.feelingGrid}>
        {feelingOptions.map(([feeling, emoji]) => (
          <label
            class={`${styles.feelingOption} ${feelings.includes(feeling) ? styles.selected : ''}`}
            key={feeling}
          >
            <input
              class={styles.visuallyHidden}
              type="checkbox"
              checked={feelings.includes(feeling)}
              onChange={() => toggleFeeling(feeling)}
            />
            <span class={styles.feelingEmoji} aria-hidden="true">
              {emoji}
            </span>
            <span>{feeling}</span>
          </label>
        ))}
      </div>
      <label for="reflection-reason">
        Quer registrar o que motivou esta tentativa?
      </label>
      <textarea
        id="reflection-reason"
        value={reason}
        onInput={(event) => setReason(event.currentTarget.value)}
        maxLength={4000}
        placeholder="Escreva apenas se isso ajudar você a entender o momento."
      />
      <InteractiveHoverButton
        variant="outline"
        colors={{ hoverBackground: '#b63838', hoverForeground: '#fff' }}
        icon={
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="m5 12 4 4L19 6" />
          </svg>
        }
        className={styles.reflectionSaveButton}
        text="Salvar reflexão neste navegador"
        onClick={() => void saveReflection()}
      />
    </div>
  );
}
