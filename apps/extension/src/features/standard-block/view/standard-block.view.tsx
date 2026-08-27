import type { useStandardBlockModel } from './standard-block.model';
import { InteractiveHoverButton } from '../../../shared/ui/interactive-hover-button';
import { Badge } from '../../../shared/ui/badge';

type StandardBlockModel = ReturnType<typeof useStandardBlockModel>;

export function StandardBlockView(props: StandardBlockModel) {
  const {
    blocks,
    hostname,
    feedback,
    isLoading,
    globalCooldownHours,
    setHostname,
    setGlobalCooldownHours,
    addBlock,
    removeBlock,
    saveGlobalCooldown,
    saveDomainCooldown,
  } = props;

  return (
    <section class="panel standard-panel" aria-labelledby="standard-blocks-title">
      <div class="panel-header">
        <div>
          <Badge tone="accent">Pausa flexível</Badge>
          <h2 id="standard-blocks-title">Bloqueio padrão</h2>
          <p>Interrompe o acesso e permite uma liberação curta depois do período de espera.</p>
        </div>
      </div>

      <div class="rules-layout">
        <form class="cooldown-form field-group" onSubmit={saveGlobalCooldown}>
          <label class="field-label" for="global-cooldown">
            Tempo entre liberações
          </label>
          <p class="field-help">
            Depois de usar uma pausa, esse período precisa passar antes de uma nova liberação.
          </p>
          <div class="form-row">
            <input
              id="global-cooldown"
              type="number"
              min="1"
              max="17568"
              step="0.5"
              list="cooldown-presets"
              value={globalCooldownHours}
              onInput={(event) => setGlobalCooldownHours(event.currentTarget.value)}
              required
            />
            <span class="input-suffix">horas</span>
            <button class="secondary-button" type="submit" disabled={isLoading}>
              Salvar tempo
            </button>
          </div>
          <datalist id="cooldown-presets">
            <option value="1" />
            <option value="2" />
            <option value="4" />
            <option value="6" />
            <option value="12" />
            <option value="24" />
          </datalist>
        </form>

        <form class="domain-form field-group" onSubmit={addBlock}>
          <label class="field-label" for="hostname">
            Site que você quer pausar
          </label>
          <p class="field-help">
            Cole um endereço completo ou digite apenas o domínio, como youtube.com.
          </p>
          <div class="form-row">
            <input
              id="hostname"
              name="hostname"
              type="text"
              inputMode="url"
              placeholder="exemplo.com"
              value={hostname}
              onInput={(event) => setHostname(event.currentTarget.value)}
              disabled={isLoading}
              required
            />
            <InteractiveHoverButton
              className="interactive-hover-button--fluid"
              text="Criar bloqueio"
              type="submit"
              loading={isLoading}
            />
          </div>
        </form>
      </div>

      <p class="feedback" aria-live="polite">
        {feedback}
      </p>
      <div class="list-heading">
        <h3>Sites bloqueados</h3>
        <Badge>{blocks.length}</Badge>
      </div>
      {blocks.length === 0 ? (
        <p class="empty-state">
          {isLoading
            ? 'Carregando bloqueios…'
            : 'Sua lista está vazia. Adicione o primeiro site acima.'}
        </p>
      ) : (
        <ul class="domain-list">
          {blocks.map((block) => (
            <li key={block.hostname}>
              <div class="domain-details">
                <strong>{block.hostname}</strong>
                <small>
                  {block.cooldownMilliseconds
                    ? `Espera própria de ${block.cooldownMilliseconds / 3_600_000} h`
                    : `Usa a espera geral de ${globalCooldownHours} h`}
                </small>
                <form
                  class="inline-cooldown"
                  onSubmit={(event) => void saveDomainCooldown(block, event)}
                >
                  <label class="sr-only" for={`cooldown-${block.ruleId}`}>
                    Tempo específico para {block.hostname}
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
                      block.cooldownMilliseconds ? block.cooldownMilliseconds / 3_600_000 : ''
                    }
                  />
                  <button class="secondary-button" type="submit">
                    Aplicar tempo próprio
                  </button>
                </form>
              </div>
              <button
                class="text-button danger-text"
                type="button"
                disabled={isLoading}
                onClick={() => void removeBlock(block)}
              >
                Remover
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
