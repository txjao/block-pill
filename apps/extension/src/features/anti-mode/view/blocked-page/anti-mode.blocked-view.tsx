import type { AntiModeBlockedModel } from './anti-mode.blocked-model';
import { Button } from '@/shared/ui/components/button';
import styles from './anti-mode.blocked.module.css';
import { Recommendation } from './components/recommendation';
import { ReflectionForm } from './components/reflection-form';

export function AntiModeBlockedView(props: AntiModeBlockedModel) {
  const {
    mode,
    hostname,
    kind,
    config,
    need,
    feedback,
    isLoading,
    setNeed,
    requestAccess,
  } = props;
  const title =
    mode === 'anti-porn'
      ? 'Seu compromisso anti-pornografia'
      : 'Seu compromisso anti-aposta';

  return (
    <section class={styles.interruption} aria-labelledby="anti-blocked-title">
      <span class={styles.eyebrow}>Uma pausa escolhida por você</span>
      <h1 id="anti-blocked-title">{title} está protegendo este momento.</h1>
      <p>
        <strong>{hostname}</strong> pode afastar você dos objetivos escolhidos.
      </p>
      {config?.goals.length ? (
        <blockquote>
          Você ativou este modo por: {config.goals.join(', ')}.
        </blockquote>
      ) : (
        <p class={styles.supportCopy}>
          Respire por alguns segundos antes de decidir o próximo passo.
        </p>
      )}

      <div class={styles.needSection}>
        <h2>O que você estava procurando?</h2>
        <div class={styles.needSelector}>
          {(
            [
              ['entertainment', 'Entretenimento'],
              ['information', 'Informação'],
              ['impulse', 'Foi só impulso'],
            ] as const
          ).map(([value, label]) => (
            <Button
              key={value}
              className={need === value ? styles.selected : undefined}
              variant="secondary"
              type="button"
              onClick={() => setNeed(value)}
            >
              {label}
            </Button>
          ))}
        </div>
        <Recommendation need={need} hobbies={config?.hobbies ?? []} />
      </div>

      <ReflectionForm {...props} />

      {config?.philosophicalKnowledge && (
        <blockquote>
          “Nenhum homem é livre se não for senhor de si mesmo.”{' '}
          <cite>Epicteto</cite>
        </blockquote>
      )}
      {kind === 'warning' ? (
        <div class={styles.warningAccess}>
          <h2>Este site também pode ter outros usos.</h2>
          <p>
            Se decidir continuar, escolha um período curto. Cada decisão fica
            registrada somente no seu histórico local.
          </p>
          <div class={styles.accessActions}>
            {([1, 5, 15] as const).map((minutes) => (
              <Button
                key={minutes}
                type="button"
                disabled={isLoading}
                onClick={() => void requestAccess(minutes)}
              >
                Usar {minutes} min
              </Button>
            ))}
          </div>
        </div>
      ) : (
        <div class={styles.explicitBlock}>
          <strong>Este site não oferece liberação.</strong>
          <p>Ele faz parte da proteção explícita deste modo.</p>
        </div>
      )}
      {feedback && <p role="status">{feedback}</p>}
    </section>
  );
}
