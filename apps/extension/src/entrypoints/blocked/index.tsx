import { Brand } from "../../shared/ui/brand";
import { renderPage } from "../../shared/ui/render-page";
import "../../shared/ui/base.css";

export function BlockedPage() {
  return (
    <main>
      <Brand title="Site bloqueado" />
      <p>
        Este domínio está na sua lista de bloqueios padrão. O desbloqueio
        temporário será disponibilizado em uma próxima etapa.
      </p>
    </main>
  );
}

renderPage(<BlockedPage />);
