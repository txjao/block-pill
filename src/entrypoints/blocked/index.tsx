import { Brand } from "../../shared/ui/brand";
import { renderPage } from "../../shared/ui/render-page";
import "../../shared/ui/base.css";

export function BlockedPage() {
  return (
    <main>
      <Brand title="Site bloqueado" />
      <p>
        A página de bloqueio está preparada. As regras e ações serão adicionadas
        na próxima fase.
      </p>
    </main>
  );
}

renderPage(<BlockedPage />);
