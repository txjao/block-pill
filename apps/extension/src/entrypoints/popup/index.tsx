import { useState } from "preact/hooks";
import { Brand } from "../../shared/ui/brand";
import { renderPage } from "../../shared/ui/render-page";
import "../../shared/ui/base.css";

export function Popup() {
  const [errorMessage, setErrorMessage] = useState("");

  async function handleOpenOptions(): Promise<void> {
    try {
      await chrome.runtime.openOptionsPage();
      window.close();
    } catch {
      setErrorMessage(
        "Não foi possível abrir as configurações. Tente novamente."
      );
    }
  }

  return (
    <main>
      <Brand title="Block Pill" />
      <section class="status" aria-labelledby="blocking-status">
        <strong id="blocking-status">Gerencie seus bloqueios</strong>
        <span>Adicione ou remova os domínios que deseja bloquear.</span>
        <button
          class="popup-primary-action"
          type="button"
          onClick={() => void handleOpenOptions()}
        >
          Abrir configurações
        </button>
        {errorMessage && (
          <p class="popup-error" role="alert">
            {errorMessage}
          </p>
        )}
      </section>
    </main>
  );
}

renderPage(<Popup />);
