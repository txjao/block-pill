import type { useAntiModeBlockedModel } from './anti-mode.blocked-model';

type AntiModeBlockedModel = ReturnType<typeof useAntiModeBlockedModel>;
const FEELINGS = [
  ['tristeza', '😔'],
  ['raiva', '😠'],
  ['frustração', '😣'],
  ['ansiedade', '😰'],
  ['solidão', '🫥'],
  ['impulso externo', '⚡'],
] as const;

export function AntiModeBlockedView(props: AntiModeBlockedModel) {
  const {
    mode,
    hostname,
    kind,
    config,
    feelings,
    reason,
    need,
    feedback,
    isLoading,
    setReason,
    setNeed,
    toggleFeeling,
    saveReflection,
    requestAccess,
  } = props;
  const title =
    mode === 'anti-porn' ? 'Seu compromisso anti-pornografia' : 'Seu compromisso anti-aposta';

  return (
    <section class="anti-interruption" aria-labelledby="anti-blocked-title">
      <span class="eyebrow">Uma pausa escolhida por você</span>
      <h1 id="anti-blocked-title">{title} está protegendo este momento.</h1>
      <p>
        <strong>{hostname}</strong> pode afastar você dos objetivos escolhidos.
      </p>
      {config?.goals.length ? (
        <blockquote>Você ativou este modo por: {config.goals.join(', ')}.</blockquote>
      ) : (
        <p class="support-copy">Respire por alguns segundos antes de decidir o próximo passo.</p>
      )}

      <div class="need-section">
        <h2>O que você estava procurando?</h2>
        <div class="need-selector">
          <button
            class={need === 'entertainment' ? 'is-selected' : 'secondary-button'}
            type="button"
            onClick={() => setNeed('entertainment')}
          >
            Entretenimento
          </button>
          <button
            class={need === 'information' ? 'is-selected' : 'secondary-button'}
            type="button"
            onClick={() => setNeed('information')}
          >
            Informação
          </button>
          <button
            class={need === 'impulse' ? 'is-selected' : 'secondary-button'}
            type="button"
            onClick={() => setNeed('impulse')}
          >
            Foi só impulso
          </button>
        </div>
        <Recommendation need={need} hobbies={config?.hobbies ?? []} />
      </div>

      <div class="reflection-form">
        <h2>Como você está se sentindo?</h2>
        <p>
          Registrar é opcional e ajuda você a reconhecer padrões. Os dados ficam neste navegador.
        </p>
        <div class="feeling-grid">
          {FEELINGS.map(([feeling, emoji]) => (
            <label
              class={`feeling-option ${feelings.includes(feeling) ? 'is-selected' : ''}`}
              key={feeling}
            >
              <input
                class="sr-only"
                type="checkbox"
                checked={feelings.includes(feeling)}
                onChange={() => toggleFeeling(feeling)}
              />
              <span class="feeling-emoji" aria-hidden="true">
                {emoji}
              </span>
              <span>{feeling}</span>
            </label>
          ))}
        </div>
        <label class="field-label" for="reflection-reason">
          Quer registrar o que motivou esta tentativa?
        </label>
        <textarea
          id="reflection-reason"
          value={reason}
          onInput={(event) => setReason(event.currentTarget.value)}
          maxLength={4000}
          placeholder="Escreva apenas se isso ajudar você a entender o momento."
        />
        <button class="secondary-button" type="button" onClick={() => void saveReflection()}>
          Salvar reflexão neste navegador
        </button>
      </div>

      {config?.philosophicalKnowledge && (
        <blockquote>
          “Nenhum homem é livre se não for senhor de si mesmo.” <cite>Epicteto</cite>
        </blockquote>
      )}
      {kind === 'warning' ? (
        <div class="warning-access">
          <h2>Este site também pode ter outros usos.</h2>
          <p>
            Se decidir continuar, escolha um período curto. Cada decisão fica registrada somente no
            seu histórico local.
          </p>
          <div class="access-actions">
            {([1, 5, 15] as const).map((minutes) => (
              <button
                key={minutes}
                type="button"
                disabled={isLoading}
                onClick={() => void requestAccess(minutes)}
              >
                Usar {minutes} min
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div class="explicit-block">
          <strong>Este site não oferece liberação.</strong>
          <p>Ele faz parte da proteção explícita deste modo.</p>
        </div>
      )}
      {feedback && <p role="status">{feedback}</p>}
    </section>
  );
}

function Recommendation({
  need,
  hobbies,
}: {
  need: 'entertainment' | 'information' | 'impulse';
  hobbies: string[];
}) {
  if (need === 'information')
    return (
      <form class="search-alternative" action="https://www.google.com/search" method="get">
        <strong>Busque a informação sem abrir o site bloqueado</strong>
        <p>Este campo envia sua pesquisa diretamente ao buscador Google.</p>
        <div class="form-row">
          <label class="sr-only" for="alternative-search">
            Termo de busca
          </label>
          <input
            id="alternative-search"
            name="q"
            type="search"
            placeholder="O que você quer encontrar?"
          />
          <button type="submit">Pesquisar no Google</button>
        </div>
      </form>
    );
  if (need === 'entertainment')
    return (
      <p class="recommendation">
        Que tal algo fora da tela: caminhar, ler, cozinhar, conversar ou praticar um esporte?
      </p>
    );
  return (
    <p class="recommendation">
      Direcione essa energia para{' '}
      {hobbies.length
        ? hobbies.join(', ')
        : 'uma caminhada curta, alongamento ou uma tarefa manual'}
      .
    </p>
  );
}
