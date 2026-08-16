import { useEffect, useState } from "preact/hooks";
import type { JSX } from "preact";
import type {
  StandardBlockingRequest,
  StandardBlockingResponse
} from "../../contracts/standard-blocking-messages";
import type { StandardBlock } from "../../modules/standard-blocking";
import { Brand } from "../../shared/ui/brand";
import { renderPage } from "../../shared/ui/render-page";
import "../../shared/ui/base.css";

export function Options() {
  const [blocks, setBlocks] = useState<StandardBlock[]>([]);
  const [hostname, setHostname] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void loadBlocks();
  }, []);

  async function loadBlocks() {
    setIsLoading(true);
    const response = await sendStandardBlockingMessage({
      type: "standard-blocking/list"
    });

    if (response.ok) {
      setBlocks(response.blocks);
      setFeedback("");
    } else {
      setFeedback(response.message);
    }

    setIsLoading(false);
  }

  async function addBlock(event: JSX.TargetedSubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const response = await sendStandardBlockingMessage({
      type: "standard-blocking/add",
      hostname
    });

    if (response.ok) {
      setBlocks(response.blocks);
      setHostname("");
      setFeedback("Domínio bloqueado.");
    } else {
      setFeedback(response.message);
    }

    setIsLoading(false);
  }

  async function removeBlock(block: StandardBlock) {
    setIsLoading(true);
    const response = await sendStandardBlockingMessage({
      type: "standard-blocking/remove",
      hostname: block.hostname
    });

    if (response.ok) {
      setBlocks(response.blocks);
      setFeedback("Domínio removido dos bloqueios padrão.");
    } else {
      setFeedback(response.message);
    }

    setIsLoading(false);
  }

  return (
    <main>
      <Brand title="Configurações" />
      <p>
        Cadastre os sites que deseja interromper. Endereços completos são
        convertidos para o domínio correspondente.
      </p>

      <section class="panel" aria-labelledby="standard-blocks-title">
        <h2 id="standard-blocks-title">Bloqueios padrão</h2>
        <form class="domain-form" onSubmit={addBlock}>
          <label for="hostname">Domínio ou endereço do site</label>
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
            <button type="submit" disabled={isLoading}>
              Bloquear
            </button>
          </div>
        </form>

        <p class="feedback" aria-live="polite">
          {feedback}
        </p>

        {blocks.length === 0 ? (
          <p class="empty-state">
            {isLoading ? "Carregando bloqueios…" : "Nenhum domínio bloqueado."}
          </p>
        ) : (
          <ul class="domain-list">
            {blocks.map((block) => (
              <li key={block.hostname}>
                <span>{block.hostname}</span>
                <button
                  class="secondary-button"
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
    </main>
  );
}

async function sendStandardBlockingMessage(
  request: StandardBlockingRequest
): Promise<StandardBlockingResponse> {
  try {
    const response = await chrome.runtime.sendMessage<
      StandardBlockingRequest,
      StandardBlockingResponse
    >(request);

    if (response && typeof response.ok === "boolean") {
      return response;
    }

    throw new Error("Resposta inválida do service worker.");
  } catch {
    return {
      ok: false,
      message: "Não foi possível comunicar com a extensão. Tente novamente."
    };
  }
}

renderPage(<Options />);
