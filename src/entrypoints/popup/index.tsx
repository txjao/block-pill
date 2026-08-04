import { Brand } from "../../shared/ui/brand";
import { renderPage } from "../../shared/ui/render-page";
import "../../shared/ui/base.css";

export function Popup() {
  return (
    <main>
      <Brand title="Block Pill" />
      <section class="status" aria-labelledby="foundation-status">
        <strong id="foundation-status">Fundação preparada</strong>
        <span>As regras de bloqueio serão adicionadas na próxima fase.</span>
      </section>
    </main>
  );
}

renderPage(<Popup />);
