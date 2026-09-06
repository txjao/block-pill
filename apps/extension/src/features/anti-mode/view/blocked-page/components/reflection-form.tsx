import type { AntiModeBlockedModel } from '@/features/anti-mode/view/blocked-page/anti-mode.blocked-model';
import { Button } from '@/shared/ui/components/button';
import styles from '@/features/anti-mode/view/blocked-page/anti-mode.blocked.module.css';

const FEELINGS = [
  ['tristeza', '😔'],
  ['raiva', '😠'],
  ['frustração', '😣'],
  ['ansiedade', '😰'],
  ['solidão', '🫥'],
  ['impulso externo', '⚡'],
] as const;

type ReflectionFormProps = Pick<
  AntiModeBlockedModel,
  'feelings' | 'reason' | 'setReason' | 'toggleFeeling' | 'saveReflection'
>;

export function ReflectionForm(props: ReflectionFormProps) {
  const { feelings, reason, setReason, toggleFeeling, saveReflection } = props;

  return (
    <div class={styles.reflectionForm}>
      <h2>Como você está se sentindo?</h2>
      <p>Registrar é opcional e ajuda você a reconhecer padrões. Os dados ficam neste navegador.</p>
      <div class={styles.feelingGrid}>
        {FEELINGS.map(([feeling, emoji]) => (
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
      <label for="reflection-reason">Quer registrar o que motivou esta tentativa?</label>
      <textarea
        id="reflection-reason"
        value={reason}
        onInput={(event) => setReason(event.currentTarget.value)}
        maxLength={4000}
        placeholder="Escreva apenas se isso ajudar você a entender o momento."
      />
      <Button variant="secondary" type="button" onClick={() => void saveReflection()}>
        Salvar reflexão neste navegador
      </Button>
    </div>
  );
}
