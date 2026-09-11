import type { ComponentType } from 'preact';
import { renderPage } from '@/shared/ui/rendering';
import {
  INTERFACE_PREVIEW_NAME,
  type InterfacePreviewName,
} from '../interface-preview.constants';
import { installChromeSimulator } from '../interface-preview.infrastructure.chrome.simulator';
import '@/shared/ui/styles/globals.css';

const interfaceName = new URLSearchParams(globalThis.location.search).get(
  'interface',
);

installChromeSimulator();

try {
  const Page = await loadInterfacePage(interfaceName);
  globalThis.document.body.classList.toggle(
    'popup',
    interfaceName === INTERFACE_PREVIEW_NAME.popup,
  );
  renderPage(<Page />);
} catch (error) {
  renderPage(
    <main>
      <h1>Interface indisponível</h1>
      <p role="alert">
        {error instanceof Error ? error.message : 'Erro desconhecido.'}
      </p>
    </main>,
  );
}

async function loadInterfacePage(name: string | null): Promise<ComponentType> {
  switch (name as InterfacePreviewName) {
    case INTERFACE_PREVIEW_NAME.popup:
      return (await import('@/entrypoints/popup/popup.page')).PopupPage;
    case INTERFACE_PREVIEW_NAME.settings:
      return (await import('@/entrypoints/settings/settings.page'))
        .SettingsPage;
    case INTERFACE_PREVIEW_NAME.blocked:
      return (await import('@/entrypoints/blocked/blocked.page')).BlockedPage;
    default:
      throw new Error('A interface solicitada não está cadastrada.');
  }
}
