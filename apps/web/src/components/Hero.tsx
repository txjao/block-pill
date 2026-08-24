import { repo } from "../content";
import { SiteHeader } from "./SiteHeader";

export function Hero() {
  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <div className="hero-media" aria-hidden="true">
        <div className="hero-media-overlay" />
      </div>
      <SiteHeader />
      <div className="hero-scene">
        <div className="hero-copy">
          <h1 id="hero-title">
            Interrompa o impulso. <em>Não a sua autonomia.</em>
          </h1>
          <p>
            Block Pill cria uma pausa consciente entre você e os sites que capturam sua atenção.
            Local, aberta e sem vigilância.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href={repo} target="_blank" rel="noreferrer">
              Explorar o código
            </a>
            <a className="text-link" href="#como">
              Entender a pausa <span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>
        <div className="hero-mechanism" role="img" aria-label="Um impulso encontra uma barreira e se transforma em escolha">
          <span className="mechanism-label">impulso</span>
          <div className="route" />
          <span className="impulse" data-impulse />
          <span className="barrier" data-barrier />
          <span className="choice" data-choice><span>escolha</span></span>
        </div>
      </div>
    </section>
  );
}
