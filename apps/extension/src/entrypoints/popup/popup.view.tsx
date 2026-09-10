import type { usePopupModel } from './popup.model';
import type { PopupPreviewFixture } from './popup.mock';
import { Badge } from '@/shared/ui/components/badge';
import { Button } from '@/shared/ui/components/button';
import { PopupHeader } from './components/popup-header';
import { SummaryRow } from './components/summary-row';
import blockPillFilledIcon from '@workspace/shared/brand/icons/block-pill-filled.svg?url';
import styles from './styles/popup.module.css';

type PopupModel = ReturnType<typeof usePopupModel>;
type PopupViewProps = PopupModel & { preview?: PopupPreviewFixture };

export function PopupView(props: PopupViewProps) {
  const context = props.preview ?? props.siteClassification;
  if (context.kind === 'stimulating') {
    return <StimulatingPopup {...props} fixture={context} />;
  }

  if (context.kind === 'paused') {
    return <PausedPopup {...props} fixture={context} />;
  }

  return <OutsidePopup {...props} />;
}

function OutsidePopup(props: PopupViewProps) {
  const {
    hostname,
    incognitoAllowed,
    incognitoStatus,
    errorMessage,
    isLoading,
    openSettings,
    openDocumentation,
  } = props;

  return (
    <main class={styles.popup}>
      <PopupHeader onOpenSettings={() => void openSettings('blocking')} />
      <div class={styles.siteRow}>
        <strong>{isLoading ? 'Consultando esta aba…' : hostname}</strong>
        <Badge variant="outline">fora da lista</Badge>
      </div>
      <Button fluid variant="primary" onClick={() => void openDocumentation()}>
        Adicionar aos estimulantes
      </Button>
      <dl class={styles.summary} aria-label="Como cada proteção funciona">
        <SummaryRow label="Pausas flexíveis" value="até 15 min por ciclo" />
        <SummaryRow label="Decisões permanentes" value="sem liberação" />
        <SummaryRow label="Modos anti" value="compromisso com prazo" />
        <SummaryRow label="Navegação anônima" value={incognitoStatus} />
      </dl>
      {!incognitoAllowed && (
        <div class={styles.permissionAlert}>
          <p>Janelas anônimas ainda não estão protegidas.</p>
          <Button variant="dark" onClick={() => void openSettings('anti')}>
            Dar permissão
          </Button>
        </div>
      )}
      <div class={styles.footerActions}>
        <Button
          fluid
          variant="dark"
          onClick={() => void openSettings('blocking')}
        >
          Gerenciar bloqueios
        </Button>
        <Button
          fluid
          variant="secondary"
          onClick={() => void openSettings('anti')}
        >
          Modos anti
        </Button>
      </div>
      {errorMessage && <p class={styles.error}>{errorMessage}</p>}
    </main>
  );
}

function StimulatingPopup({
  fixture,
  openSettings,
  blockStandard,
  preparePermanentBlock,
  pendingAction,
  errorMessage,
}: PopupViewProps & {
  fixture:
    | Extract<PopupPreviewFixture, { kind: 'stimulating' }>
    | {
        kind: 'stimulating';
        hostname: string;
      };
}) {
  return (
    <main class={styles.popup}>
      <PopupHeader onOpenSettings={() => void openSettings('blocking')} />
      <section class={styles.currentSite} aria-labelledby="stimulating-site">
        <p>
          Nesta aba ·{' '}
          <span
            class={styles.tooltipTrigger}
            tabIndex={0}
            aria-describedby="stimulating-tooltip"
          >
            estimulante
            <span
              id="stimulating-tooltip"
              class={styles.tooltip}
              role="tooltip"
            >
              Este site está na sua lista de sites estimulantes.
            </span>
          </span>
        </p>
        <h1 id="stimulating-site">{fixture.hostname}</h1>
      </section>
      <div class={styles.contextActions}>
        <Button
          fluid
          variant="primary"
          loading={pendingAction === 'standard'}
          disabled={pendingAction !== undefined}
          onClick={() => void blockStandard()}
        >
          Bloquear
        </Button>
        <Button
          fluid
          variant="secondary"
          loading={pendingAction === 'permanent'}
          disabled={pendingAction !== undefined}
          onClick={() => void preparePermanentBlock()}
        >
          Bloquear em definitivo
        </Button>
      </div>
      <dl class={styles.summary} aria-label="Resumo deste site">
        <SummaryRow
          label="Tempo neste site hoje"
          value={'timeToday' in fixture ? fixture.timeToday : 'sem dados ainda'}
        />
        <SummaryRow
          label="Desde a instalação"
          value={
            'sinceInstallation' in fixture
              ? fixture.sinceInstallation
              : 'sem dados ainda'
          }
        />
      </dl>
      <Button
        className={styles.settingsTextButton}
        variant="text"
        onClick={() => void openSettings('blocking')}
      >
        Abrir configurações
      </Button>
      {errorMessage && <p class={styles.error}>{errorMessage}</p>}
    </main>
  );
}

function PausedPopup({
  fixture,
  openSettings,
  standardSnapshot,
}: PopupViewProps & {
  fixture:
    | Extract<PopupPreviewFixture, { kind: 'paused' }>
    | {
        kind: 'paused';
        hostname: string;
      };
}) {
  const remainingMinutes =
    'remainingMinutes' in fixture
      ? fixture.remainingMinutes
      : (standardSnapshot?.remainingMinutes ?? 0);
  const statusLabel =
    standardSnapshot?.status === 'cooldown'
      ? 'Em tempo de espera'
      : standardSnapshot?.status === 'active'
        ? 'Acesso temporário ativo'
        : 'Pausa flexível';
  return (
    <main class={`${styles.popup} ${styles.pausedPopup}`}>
      <section class={styles.pausedHeader}>
        <header class={styles.pausedTopbar}>
          <strong>Block Pill</strong>
          <button type="button" onClick={() => void openSettings('blocking')}>
            Configurações
          </button>
        </header>
        <div class={styles.pausedSite}>
          <img src={blockPillFilledIcon} alt="" />
          <div>
            <span>Nesta aba · em pausa</span>
            <h1>{fixture.hostname}</h1>
          </div>
        </div>
        <p>Uma pausa entre o impulso e o próximo clique.</p>
      </section>
      <section class={styles.pausedBody}>
        <div class={styles.remainingTime}>
          <strong>{remainingMinutes}</strong>
          <span>min restantes de uso</span>
        </div>
        <dl class={styles.summary} aria-label="Resumo desta pausa">
          <SummaryRow
            label="Tipo de bloqueio"
            value={'blockType' in fixture ? fixture.blockType : statusLabel}
          />
          <SummaryRow
            label="Liberações hoje"
            value={
              'releasesToday' in fixture
                ? fixture.releasesToday
                : `${standardSnapshot?.usedMinutes ?? 0} de 15 min`
            }
          />
        </dl>
        <div class={styles.contextActions}>
          <Button fluid variant="primary" disabled>
            Liberar por {remainingMinutes} min
          </Button>
          <Button
            className={styles.settingsTextButton}
            variant="text"
            onClick={() => void openSettings('blocking')}
          >
            Abrir configurações
          </Button>
        </div>
      </section>
    </main>
  );
}
