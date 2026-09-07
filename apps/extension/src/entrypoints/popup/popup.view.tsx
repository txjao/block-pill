import type { usePopupModel } from './popup.model';
import { Badge } from '@/shared/ui/components/badge';
import { Button } from '@/shared/ui/components/button';
import { PopupHeader } from './components/popup-header';
import { SummaryRow } from './components/summary-row';
import styles from './styles/popup.module.css';

type PopupModel = ReturnType<typeof usePopupModel>;

export function PopupView(props: PopupModel) {
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
      <Button
        fluid
        variant="secondary"
        onClick={() => void openDocumentation()}
      >
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
          <Button variant="dark" onClick={() => void openSettings('anti')}>
            Dar permissão
          </Button>
        </div>
      )}
      <div class={styles.footerActions}>
        <Button fluid onClick={() => void openSettings('blocking')}>
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
