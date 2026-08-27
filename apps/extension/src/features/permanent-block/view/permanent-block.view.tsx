import type { usePermanentBlockModel } from './permanent-block.model';
import { InteractiveHoverButton } from '../../../shared/ui/interactive-hover-button';
import { Badge } from '../../../shared/ui/badge';
import { InfoPopover } from '../../../shared/ui/info-popover';

type PermanentBlockModel = ReturnType<typeof usePermanentBlockModel>;
const docsUrl =
  'https://github.com/txjao/block-pill/blob/main/docs/BLOCKING_RULES.md#bloqueio-permanente';

export function PermanentBlockView(props: PermanentBlockModel) {
  const {
    blocks,
    hostname,
    pendingHostname,
    feedback,
    isLoading,
    setHostname,
    setPendingHostname,
    prepare,
    confirm,
  } = props;

  return (
    <section class="panel permanent-panel" aria-labelledby="permanent-title">
      <div class="panel-header">
        <div>
          <Badge>Pausa definitiva</Badge>
          <h2 id="permanent-title">Bloqueio permanente</h2>
          <p>Para uma decisão que você não quer renegociar nos momentos de impulso.</p>
        </div>
        <InfoPopover label="Como funciona o bloqueio permanente">
          A regra permanece ativa enquanto o Block Pill estiver instalado e não pode ser removida
          pelas configurações.{' '}
          <a href={docsUrl} target="_blank" rel="noreferrer">
            Entenda os detalhes na documentação.
          </a>
        </InfoPopover>
      </div>

      <form class="domain-form field-group" onSubmit={prepare}>
        <label class="field-label" for="permanent-hostname">
          Site que ficará bloqueado
        </label>
        <p class="field-help">O domínio e seus subdomínios serão incluídos na mesma decisão.</p>
        <div class="form-row">
          <input
            id="permanent-hostname"
            inputMode="url"
            placeholder="exemplo.com"
            value={hostname}
            onInput={(event) => setHostname(event.currentTarget.value)}
            disabled={isLoading}
            required
          />
          <InteractiveHoverButton
            className="interactive-hover-button--fluid"
            text="Bloquear permanentemente"
            type="submit"
            loading={isLoading}
          />
        </div>
      </form>

      {pendingHostname && (
        <div
          class="friction-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="permanent-confirm-title"
        >
          <span class="dialog-kicker">Decisão crítica</span>
          <h2 id="permanent-confirm-title">Confirmar bloqueio permanente?</h2>
          <p>
            <strong>{pendingHostname}</strong> e seus subdomínios não poderão ser liberados pelas
            configurações do Block Pill.
          </p>
          <p>Confirme somente se esta é a proteção que você deseja manter.</p>
          <div class="dialog-actions">
            <button class="secondary-button" type="button" onClick={() => setPendingHostname('')}>
              Voltar e revisar
            </button>
            <button
              class="danger-button"
              type="button"
              onClick={() => void confirm()}
              disabled={isLoading}
            >
              Confirmar bloqueio
            </button>
          </div>
        </div>
      )}

      {feedback && (
        <p class="feedback" role="status">
          {feedback}
        </p>
      )}
      <div class="list-heading">
        <h3>Bloqueios permanentes</h3>
        <Badge>{blocks.length}</Badge>
      </div>
      {blocks.length ? (
        <ul class="domain-list permanent-list">
          {blocks.map((block) => (
            <li key={block.hostname}>
              <strong>{block.hostname}</strong>
            </li>
          ))}
        </ul>
      ) : (
        <p class="empty-state">Nenhum bloqueio permanente cadastrado.</p>
      )}
    </section>
  );
}
