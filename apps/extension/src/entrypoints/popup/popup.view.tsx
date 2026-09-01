import type { usePopupModel } from './popup.model';
import { Badge } from '../../shared/ui/components/badge/badge';
import { Brand } from '../../shared/ui/components/brand/brand';
import { Button } from '../../shared/ui/components/button/button';
import { Tooltip } from '../../shared/ui/components/tooltip/tooltip';
import styles from './popup.module.css';

type PopupModel = ReturnType<typeof usePopupModel>;

export function PopupView(props: PopupModel) {
  const {
    state,
    hostname,
    releasesToday,
    pausedToday,
    sinceInstallation,
    remainingTime,
    blockType,
    incognitoAllowed,
    incognitoStatus,
    errorMessage,
    isLoading,
    openOptions,
    openDocumentation,
  } = props;

  if (state === 'stimulating') {
    return (
      <main class={styles.popup}>
        <PopupHeader onOpenSettings={() => void openOptions('blocking')} />
        <p class={styles.eyebrow}>
          Nesta aba ·{' '}
          <Tooltip
            content="Este site está na lista de sites estimulantes da ferramenta!"
            side="bottom"
          >
            <button class={styles.tooltipTrigger} type="button">
              estimulante
            </button>
          </Tooltip>
        </p>
        <h1 class={styles.hostname}>{hostname}</h1>
        <div class={styles.actions}>
          <Button fluid disabled title="Integração dinâmica pendente">
            Pausar 15 min
          </Button>
          <Button fluid variant="dark" disabled title="Integração dinâmica pendente">
            Bloquear em definitivo
          </Button>
        </div>
        <dl class={styles.summary}>
          <SummaryRow label="Liberações hoje" value={releasesToday} />
          <SummaryRow label="Tempo em pausa hoje" value={pausedToday} />
          <SummaryRow label="Desde a instalação" value={sinceInstallation} />
        </dl>
        {errorMessage && <p class={styles.error}>{errorMessage}</p>}
      </main>
    );
  }

  if (state === 'paused') {
    return (
      <main class={`${styles.popup} ${styles.paused}`}>
        <header class={styles.inverseHeader}>
          <div class={styles.inverseTopline}>
            <Brand variant="inverse" />
            <button type="button" onClick={() => void openOptions('blocking')}>
              Configurações
            </button>
          </div>
          <p>Nesta aba · em pausa</p>
          <h1>{hostname}</h1>
          <span>Uma pausa entre o impulso e o próximo clique.</span>
        </header>
        <div class={styles.pausedBody}>
          <strong class={styles.timer}>{remainingTime}</strong>
          <span class={styles.timerLabel}>restantes nesta pausa</span>
          <dl class={styles.summary}>
            <SummaryRow label="Tipo de bloqueio" value={blockType} />
            <SummaryRow label="Liberações hoje" value={releasesToday} />
          </dl>
          <div class={styles.actions}>
            <Button fluid disabled title="Integração dinâmica pendente">
              Liberar por 15 min
            </Button>
            <Button fluid variant="secondary">
              Manter o bloqueio
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main class={styles.popup}>
      <PopupHeader onOpenSettings={() => void openOptions('blocking')} />
      <div class={styles.siteRow}>
        <strong>{isLoading ? 'Consultando esta aba…' : hostname}</strong>
        <Badge variant="outline">fora da lista</Badge>
      </div>
      <Button fluid variant="secondary" onClick={() => void openDocumentation()}>
        Adicionar aos estimulantes
      </Button>
      <dl class={styles.summary}>
        <SummaryRow label="Bloqueios flexíveis" value="proteção disponível" />
        <SummaryRow label="Decisões permanentes" value="proteção disponível" />
        <SummaryRow label="Modos anti" value="configuração local" />
        <SummaryRow label="Navegação anônima" value={incognitoStatus} />
      </dl>
      {!incognitoAllowed && (
        <div class={styles.permissionAlert}>
          <p>Janelas anônimas ainda não estão protegidas.</p>
          <Button variant="dark" onClick={() => void openOptions('anti')}>
            Dar permissão
          </Button>
        </div>
      )}
      <div class={styles.footerActions}>
        <Button fluid onClick={() => void openOptions('blocking')}>
          Gerenciar bloqueios
        </Button>
        <Button fluid variant="secondary" onClick={() => void openOptions('anti')}>
          Modos anti
        </Button>
      </div>
      {errorMessage && <p class={styles.error}>{errorMessage}</p>}
    </main>
  );
}

function PopupHeader({ onOpenSettings }: { onOpenSettings: () => void }) {
  return (
    <header class={styles.header}>
      <Brand />
      <button type="button" onClick={onOpenSettings}>
        Configurações
      </button>
    </header>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
