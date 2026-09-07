import type { useStandardBlockBlockedModel } from './standard-block.blocked-model';
import { Button } from '@/shared/ui/components/button';
import { InteractiveHoverButton } from '@/shared/ui/components/interactive-hover-button';
import { PageBrand } from '@/shared/ui/components/page-brand';
import styles from './standard-block.blocked.module.css';

type StandardBlockBlockedModel = ReturnType<
  typeof useStandardBlockBlockedModel
>;
export function StandardBlockBlockedView(props: StandardBlockBlockedModel) {
  const {
    accessDurations,
    availableIn,
    documentationUrl,
    hostname,
    attemptedHostname,
    snapshot,
    feedback,
    isLoading,
    requestAccess,
    allowSubdomain,
  } = props;

  if (!snapshot) {
    return (
      <main class={styles.page}>
        <PageBrand title="Site bloqueado" />
        <p role={feedback ? 'alert' : undefined}>{feedback || 'Carregando…'}</p>
      </main>
    );
  }

  if (attemptedHostname) {
    return (
      <main class={styles.page}>
        <PageBrand title="Site bloqueado" />
        <section
          class={`${styles.interruption} ${styles.subdomainInterruption}`}
          aria-labelledby="blocked-title"
        >
          <span class={styles.eyebrow}>Uma exceção possível</span>
          <h1 id="blocked-title">Opa! Este subdomínio veio junto.</h1>
          <p>
            Você bloqueou <strong>{hostname}</strong>, então{' '}
            <strong>{attemptedHostname}</strong> também entrou na pausa.
          </p>
          <p>
            Se ele for uma ferramenta que você realmente utiliza, libere somente
            este endereço abaixo.
          </p>
          <div class={styles.accessActions}>
            <InteractiveHoverButton
              className="interactive-hover-button--fluid"
              text="Liberar este subdomínio"
              loading={isLoading}
              onClick={() => void allowSubdomain()}
            />
            <a
              class={styles.textLink}
              href={documentationUrl}
              target="_blank"
              rel="noreferrer"
            >
              Entender mais
            </a>
          </div>
          {feedback && <p role="alert">{feedback}</p>}
        </section>
      </main>
    );
  }

  if (snapshot.status === 'cooldown') {
    return (
      <main class={styles.page}>
        <PageBrand title="Site bloqueado" />
        <section class={styles.interruption} aria-labelledby="blocked-title">
          <span class={styles.eyebrow}>Pausa em andamento</span>
          <h1 id="blocked-title">Seu tempo acabou.</h1>
          <p>
            O acesso a <strong>{hostname}</strong> volta em {availableIn}.
          </p>
          <p class={styles.supportCopy}>
            Use esta pausa para retomar o que você queria fazer.
          </p>
        </section>
      </main>
    );
  }

  if (snapshot.status === 'active') {
    return (
      <main class={styles.page}>
        <PageBrand title="Site bloqueado" />
        <section class={styles.interruption}>
          <h1>Acesso temporário ativo</h1>
          <p>Você já pode voltar para {hostname}.</p>
        </section>
      </main>
    );
  }

  return (
    <main class={styles.page}>
      <PageBrand title="Site bloqueado" />
      <section class={styles.interruption} aria-labelledby="blocked-title">
        <span class={styles.eyebrow}>Antes do próximo clique</span>
        <h1 id="blocked-title">Uma pausa para escolher.</h1>
        <p>
          <strong>Todo mundo merece 15 minutinhos de descanso!</strong>
        </p>
        <p>
          Você ainda tem {snapshot.remainingMinutes} minutos disponíveis neste
          ciclo.
        </p>
        <div
          class={styles.accessActions}
          aria-label="Escolha o tempo de acesso"
        >
          {accessDurations.map((minutes) => (
            <Button
              key={minutes}
              type="button"
              disabled={
                isLoading || !snapshot.enabledDurations.includes(minutes)
              }
              onClick={() => void requestAccess(minutes)}
            >
              Usar {minutes} min
            </Button>
          ))}
        </div>
        <p class={styles.supportCopy}>
          Quando os 15 minutos terminarem, o tempo de espera deste site começa.
        </p>
        {feedback && <p role="alert">{feedback}</p>}
      </section>
    </main>
  );
}
