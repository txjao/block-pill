import { useEffect, useState } from 'preact/hooks';
import { Brand } from '../../shared/ui/brand';
import { renderPage } from '../../shared/ui/render-page';
import { InteractiveHoverButton } from '../../shared/ui/interactive-hover-button';
import type { AntiModeRequest, AntiModeResponse } from '../../features/anti-mode';
import '../../shared/ui/base.css';
import '../../shared/ui/design-system.css';

import '../../shared/ui/feature-overrides.css';
export function Popup() {
  const [errorMessage, setErrorMessage] = useState('');
  const [status, setStatus] = useState<{
    allowed: boolean;
    blocked: boolean;
    locked: boolean;
    enabled: boolean;
    suspendedUntil?: number;
  }>();

  useEffect(() => {
    void loadStatus();
  }, []);

  async function loadStatus() {
    const response = await send({ type: 'incognito/status' });
    if (response.ok && 'incognitoAllowed' in response) {
      setStatus({
        allowed: response.incognitoAllowed,
        blocked: response.blocked,
        locked: response.lockedByAntiMode,
        enabled: response.controlEnabled,
        suspendedUntil: response.suspendedUntil,
      });
    } else if (!response.ok) setErrorMessage(response.message);
  }

  async function openOptions(section = 'blocking') {
    try {
      await chrome.tabs.create({
        url: chrome.runtime.getURL(`src/entrypoints/options/index.html?section=${section}`),
      });
      window.close();
    } catch {
      setErrorMessage('Não foi possível abrir as configurações.');
    }
  }

  return (
    <main>
      <Brand title="Block Pill" />
      <p>Uma pausa entre o impulso e o próximo clique.</p>
      <section class="popup-status" aria-labelledby="incognito-title">
        <strong id="incognito-title">Navegação anônima</strong>
        <p>{statusText(status)}</p>
      </section>
      <div class="popup-actions">
        <InteractiveHoverButton
          className="interactive-hover-button--fluid"
          text="Gerenciar bloqueios"
          onClick={() => void openOptions('blocking')}
        />
        <button class="secondary-button" type="button" onClick={() => void openOptions('anti')}>
          Configurar modos anti
        </button>
      </div>
      {errorMessage && (
        <p class="popup-error" role="alert">
          {errorMessage}
        </p>
      )}
    </main>
  );
}

function statusText(
  status:
    | {
        allowed: boolean;
        blocked: boolean;
        locked: boolean;
        enabled: boolean;
        suspendedUntil?: number;
      }
    | undefined,
) {
  if (!status) return 'Consultando a proteção…';
  if (!status.allowed) return 'A extensão ainda não tem permissão para proteger janelas anônimas.';
  if (status.locked) return 'Proteção ativa enquanto um compromisso anti estiver em andamento.';
  if (!status.enabled) return 'Proteção desativada. Você pode alterá-la nas configurações.';
  if (status.blocked) return 'Abertura de janelas anônimas bloqueada.';
  if (status.suspendedUntil)
    return `Proteção pausada até ${new Intl.DateTimeFormat('pt-BR', { timeStyle: 'short' }).format(status.suspendedUntil)}.`;
  return 'Proteção pronta.';
}

async function send(request: AntiModeRequest): Promise<AntiModeResponse> {
  try {
    return await chrome.runtime.sendMessage<AntiModeRequest, AntiModeResponse>(request);
  } catch {
    return { ok: false, message: 'Não foi possível consultar a proteção anônima.' };
  }
}

renderPage(<Popup />);
