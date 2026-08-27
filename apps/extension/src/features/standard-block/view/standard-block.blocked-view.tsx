import type { useStandardBlockBlockedModel } from './standard-block.blocked-model';
import { InteractiveHoverButton } from '../../../shared/ui/interactive-hover-button';

type StandardBlockBlockedModel = ReturnType<typeof useStandardBlockBlockedModel>;
const docsUrl =
  'https://github.com/txjao/block-pill/blob/main/docs/BLOCKING_RULES.md#exceções-de-subdomínio';

export function StandardBlockBlockedView(props: StandardBlockBlockedModel) {
  const {
    hostname,
    attemptedHostname,
    snapshot,
    feedback,
    isLoading,
    requestAccess,
    allowSubdomain,
  } = props;

  if (!snapshot) return <p role={feedback ? 'alert' : undefined}>{feedback || 'Carregando…'}</p>;

  if (attemptedHostname) {
    return (
      <section class="interruption subdomain-interruption" aria-labelledby="blocked-title">
        <span class="eyebrow">Uma exceção possível</span>
        <h1 id="blocked-title">Opa! Este subdomínio veio junto.</h1>
        <p>
          Você bloqueou <strong>{hostname}</strong>, então <strong>{attemptedHostname}</strong>{' '}
          também entrou na pausa.
        </p>
        <p>
          Se ele for uma ferramenta que você realmente utiliza, libere somente este endereço abaixo.
        </p>
        <div class="access-actions">
          <InteractiveHoverButton
            className="interactive-hover-button--fluid"
            text="Liberar este subdomínio"
            loading={isLoading}
            onClick={() => void allowSubdomain()}
          />
          <a class="text-link" href={docsUrl} target="_blank" rel="noreferrer">
            Entender mais
          </a>
        </div>
        {feedback && <p role="alert">{feedback}</p>}
      </section>
    );
  }

  if (snapshot.status === 'cooldown') {
    return (
      <section class="interruption" aria-labelledby="blocked-title">
        <span class="eyebrow">Pausa em andamento</span>
        <h1 id="blocked-title">Seu tempo acabou.</h1>
        <p>
          O acesso a <strong>{hostname}</strong> volta em {formatRemaining(snapshot.availableAt)}.
        </p>
        <p class="support-copy">Use esta pausa para retomar o que você queria fazer.</p>
      </section>
    );
  }

  if (snapshot.status === 'active') {
    return (
      <section class="interruption">
        <h1>Acesso temporário ativo</h1>
        <p>Você já pode voltar para {hostname}.</p>
      </section>
    );
  }

  return (
    <section class="interruption" aria-labelledby="blocked-title">
      <span class="eyebrow">Antes do próximo clique</span>
      <h1 id="blocked-title">Uma pausa para escolher.</h1>
      <p>
        <strong>Todo mundo merece 15 minutinhos de descanso!</strong>
      </p>
      <p>Você ainda tem {snapshot.remainingMinutes} minutos disponíveis neste ciclo.</p>
      <div class="access-actions" aria-label="Escolha o tempo de acesso">
        {([1, 5, 15] as const).map((minutes) => (
          <button
            key={minutes}
            type="button"
            disabled={isLoading || !snapshot.enabledDurations.includes(minutes)}
            onClick={() => void requestAccess(minutes)}
          >
            Usar {minutes} min
          </button>
        ))}
      </div>
      <p class="support-copy">
        Quando os 15 minutos terminarem, o tempo de espera deste site começa.
      </p>
      {feedback && <p role="alert">{feedback}</p>}
    </section>
  );
}

function formatRemaining(availableAt?: number) {
  if (!availableAt) return 'alguns instantes';
  const minutes = Math.ceil(Math.max(0, availableAt - Date.now()) / 60_000);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.ceil(minutes / 60);
  return hours < 48 ? `${hours} h` : `${Math.ceil(hours / 24)} dias`;
}
