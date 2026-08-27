import type { AntiModeId } from '../domain/anti-mode.types';
import type { useAntiModeModel } from './anti-mode.model';
import { Toggle } from '../../../shared/ui/toggle';
import { Badge } from '../../../shared/ui/badge';

type AntiModeModel = ReturnType<typeof useAntiModeModel>;
const copy = {
  'anti-porn': {
    title: 'Anti-pornografia',
    description:
      'Reduza encontros impulsivos com conteúdo adulto e crie espaço para retomar seus objetivos.',
    domainHelp: 'Adicione sites adultos que não aparecem na proteção inicial.',
  },
  'anti-bet': {
    title: 'Anti-aposta',
    description:
      'Crie distância de bets, cassinos e estímulos que incentivam decisões financeiras por impulso.',
    domainHelp: 'Adicione casas de aposta ou páginas promocionais que você encontrou.',
  },
} as const;

export function AntiModeView(props: AntiModeModel) {
  const {
    configs,
    drafts,
    feedback,
    isLoading,
    incognitoAllowed,
    pendingDeactivate,
    showCelebration,
    updateDraft,
    activate,
    addDomain,
    setPendingDeactivate,
    confirmDeactivate,
    setShowCelebration,
    openIncognitoSettings,
  } = props;

  return (
    <section class="anti-section" aria-labelledby="anti-title">
      <div class="section-heading">
        <div>
          <Badge tone="accent">Proteção por objetivo</Badge>
          <h2 id="anti-title">Modos anti</h2>
          <p>
            Escolha um compromisso. Cada modo tem um propósito próprio, mesmo quando algumas regras
            técnicas são parecidas.
          </p>
        </div>
      </div>

      {!incognitoAllowed && (
        <div class="permission-alert" role="alert">
          <strong>Permita a proteção em janelas anônimas</strong>
          <p>Sem essa permissão, uma janela anônima poderia ignorar o compromisso escolhido.</p>
          <button type="button" onClick={() => void openIncognitoSettings()}>
            Abrir permissão da extensão
          </button>
        </div>
      )}

      <div class="anti-mode-stack">
        {(['anti-porn', 'anti-bet'] as const).map((mode) => {
          const config = configs.find((item) => item.id === mode);
          const draft = drafts[mode];
          const active = config?.enabled ?? false;
          const canDeactivate =
            active && !config?.permanent && (config?.commitmentEndsAt ?? Infinity) <= Date.now();
          return (
            <article class={`anti-panel anti-panel--${mode}`} key={mode}>
              <header class="anti-panel-header">
                <div>
                  <Badge tone={active ? 'positive' : 'neutral'}>
                    {active ? 'Proteção ativa' : 'Inativo'}
                  </Badge>
                  <h3>{copy[mode].title}</h3>
                  <p>{copy[mode].description}</p>
                </div>
                <Toggle
                  checked={active}
                  disabled={
                    isLoading || (!incognitoAllowed && !active) || (active && !canDeactivate)
                  }
                  label={active ? 'Modo ativo' : 'Ativar modo'}
                  description={
                    active
                      ? canDeactivate
                        ? 'O prazo terminou. Você pode desligar quando quiser.'
                        : 'O modo ficará ligado até o compromisso terminar.'
                      : 'Revise o prazo e ative quando estiver pronto.'
                  }
                  onChange={(checked) =>
                    checked ? void activate(mode) : setPendingDeactivate(mode)
                  }
                />
              </header>

              {active && config ? (
                <ActiveMode config={config} />
              ) : (
                <div class="anti-form">
                  <div class="field-group">
                    <label class="field-label" for={`${mode}-duration`}>
                      Duração do compromisso
                    </label>
                    <p class="field-help">
                      Durante esse período o modo não poderá ser desligado por impulso.
                    </p>
                    <div class="duration-row">
                      <input
                        id={`${mode}-duration`}
                        type="number"
                        min="1"
                        list={`${mode}-duration-presets`}
                        value={draft.durationValue}
                        disabled={draft.permanent}
                        onInput={(event) =>
                          updateDraft(mode, 'durationValue', event.currentTarget.value)
                        }
                      />
                      <datalist id={`${mode}-duration-presets`}>
                        <option value="1" />
                        <option value="7" />
                        <option value="31" />
                        <option value="366" />
                      </datalist>
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
                    onChange={(checked) => updateDraft(mode, 'permanent', checked)}
                  />
                  <label class="field-group">
                    <span class="field-label">
                      Por que isso importa para você? <small>opcional</small>
                    </span>
                    <textarea
                      value={draft.goals}
                      onInput={(event) => updateDraft(mode, 'goals', event.currentTarget.value)}
                      placeholder={
                        mode === 'anti-porn'
                          ? 'Relacionamentos, presença, autoestima…'
                          : 'Tranquilidade financeira, família, planos…'
                      }
                    />
                  </label>
                  <label class="field-group">
                    <span class="field-label">
                      Alternativas que fazem bem <small>opcional</small>
                    </span>
                    <textarea
                      value={draft.hobbies}
                      onInput={(event) => updateDraft(mode, 'hobbies', event.currentTarget.value)}
                      placeholder="Caminhar, ler, cozinhar, conversar, treinar…"
                    />
                  </label>
                  <label class="confirm-check">
                    <input
                      type="checkbox"
                      checked={draft.philosophicalKnowledge}
                      onChange={(event) =>
                        updateDraft(mode, 'philosophicalKnowledge', event.currentTarget.checked)
                      }
                    />
                    Mostrar reflexões filosóficas nos momentos de pausa
                  </label>
                  {configs.some(
                    (item) => item.id !== mode && (item.goals.length || item.hobbies.length),
                  ) && (
                    <label class="confirm-check">
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
              )}

              <form
                class="domain-form field-group"
                onSubmit={(event) => void addDomain(mode, event)}
              >
                <label class="field-label" for={`${mode}-domain`}>
                  Adicionar site à proteção
                </label>
                <p class="field-help">{copy[mode].domainHelp}</p>
                <div class="form-row">
                  <input
                    id={`${mode}-domain`}
                    inputMode="url"
                    placeholder="exemplo.com"
                    value={draft.hostname}
                    onInput={(event) => updateDraft(mode, 'hostname', event.currentTarget.value)}
                    required
                  />
                  <button type="submit" disabled={isLoading}>
                    Adicionar site
                  </button>
                </div>
              </form>
              <details>
                <summary>{config?.domains.length ?? 0} sites adicionados manualmente</summary>
                <ul class="compact-list">
                  {config?.domains.map((domain) => (
                    <li key={domain}>{domain}</li>
                  ))}
                </ul>
              </details>
            </article>
          );
        })}
      </div>

      {pendingDeactivate && (
        <DeactivateDialog
          mode={pendingDeactivate}
          isLoading={isLoading}
          onCancel={() => setPendingDeactivate(undefined)}
          onConfirm={() => void confirmDeactivate()}
        />
      )}
      {showCelebration && (
        <div class="friction-dialog celebration" role="dialog" aria-modal="true">
          <h2>Você cumpriu seu compromisso.</h2>
          <p>Reconheça o esforço antes de escolher o próximo passo.</p>
          <button type="button" onClick={() => setShowCelebration(false)}>
            Continuar
          </button>
        </div>
      )}
      {feedback && (
        <p class="feedback" role="status">
          {feedback}
        </p>
      )}
    </section>
  );
}

function ActiveMode({ config }: { config: NonNullable<AntiModeModel['configs'][number]> }) {
  return (
    <div class="active-commitment">
      <strong>
        {config.permanent
          ? 'Compromisso sem prazo definido'
          : `Protegido até ${new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long', timeStyle: 'short' }).format(config.commitmentEndsAt)}`}
      </strong>
      <p>
        {config.goals.length
          ? `Você escolheu este modo por: ${config.goals.join(', ')}`
          : 'Seu compromisso está ativo.'}
      </p>
    </div>
  );
}

function DeactivateDialog({
  mode,
  isLoading,
  onCancel,
  onConfirm,
}: {
  mode: AntiModeId;
  isLoading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      class="friction-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="anti-deactivate-title"
    >
      <span class="dialog-kicker">Fim do compromisso</span>
      <h2 id="anti-deactivate-title">Desativar esta proteção?</h2>
      <p>
        Se ainda quiser apoio, mantenha o modo ativo. Seus objetivos e registros locais não serão
        apagados.
      </p>
      <div class="dialog-actions">
        <button class="secondary-button" type="button" onClick={onCancel}>
          Manter proteção
        </button>
        <button type="button" disabled={isLoading} onClick={onConfirm}>
          Desativar modo
        </button>
      </div>
      <span class="sr-only">{mode}</span>
    </div>
  );
}
