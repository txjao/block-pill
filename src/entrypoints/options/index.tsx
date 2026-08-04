import { Brand } from "../../shared/ui/brand";
import { renderPage } from "../../shared/ui/render-page";
import "../../shared/ui/base.css";

export function Options() {
  return (
    <main>
      <Brand title="Configurações" />
      <p>
        As configurações de bloqueios padrão e permanentes serão implementadas
        separadamente.
      </p>
      <section class="status" aria-labelledby="privacy-status">
        <strong id="privacy-status">Privacidade desde a fundação</strong>
        <span>
          Nesta fase, a extensão não solicita acesso às páginas visitadas.
        </span>
      </section>
    </main>
  );
}

renderPage(<Options />);
