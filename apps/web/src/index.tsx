import { StrictMode, useRef } from 'react';
import { createRoot } from 'react-dom/client';

import { Hero } from './components/Hero';
import { Logo } from './components/SiteHeader';
import { ProductStory } from './components/ProductStory';
import { InteractiveHoverButton } from './components/ui/interactive-hover-button';

import { ideas, repo } from './content';
import { useLandingMotion } from './motion/use-landing-motion';

import '@fontsource-variable/bricolage-grotesque';
import './landing.css';
import './icon-palette-experiment.css'; // Remove this line to revert the palette experiment.
import './landing-polish.css'; // Remove this line to revert the interaction and viewport polish.

function Principles() {
  return (
    <section className="principles" id="principios">
      <h2>Foco não deveria custar sua privacidade.</h2>

      <div>
        <p>
          Ferramentas de bem-estar digital não precisam observar cada movimento para ajudar. Sua
          lista permanece no navegador, e você continua no controle.
        </p>

        <blockquote>
          “Criar fricção contra decisões impulsivas sem impedir a desinstalação.”
          <cite>Princípio de produto do Block Pill</cite>
        </blockquote>
      </div>
    </section>
  );
}

function Roadmap() {
  return (
    <section className="roadmap">
      <div className="roadmap-intro">
        <h2>O projeto está aberto antes de estar pronto.</h2>
        <p>Direções em estudo, não funcionalidades prometidas.</p>
      </div>

      <div className="roadmap-list">
        {ideas.map(([title, text]) => (
          <article key={title}>
            <h3>{title}</h3>
            <p>{text}</p>
            <span>Em exploração</span>
          </article>
        ))}
      </div>
    </section>
  );
}

function Contribute() {
  return (
    <section className="contribute">
      <div>
        <h2>Construa a próxima pausa com a gente.</h2>
        <p>Há espaço para código, design, pesquisa, documentação e boas perguntas.</p>
      </div>

      <div className="contribute-actions">
        <InteractiveHoverButton
          className="interactive-hover-button--fluid"
          text="Encontrar uma issue"
          href={`${repo}/issues`}
          target="_blank"
          rel="noreferrer"
        />

        <a
          className="motion-link motion-link--external"
          href={repo}
          target="_blank"
          rel="noreferrer"
        >
          Conhecer o repositório <span aria-hidden="true">↗</span>
        </a>
      </div>
    </section>
  );
}

function App() {
  const scope = useRef<HTMLDivElement>(null);

  useLandingMotion(scope);

  return (
    <div ref={scope}>
      <main>
        <Hero />
        <ProductStory />
        <Principles />
        <Roadmap />
        <Contribute />
      </main>

      <footer>
        <Logo />

        <p>Privacidade, foco e código aberto.</p>

        <div>
          <a href={`${repo}/blob/main/PRIVACY.md`}>Privacidade</a>
          <a href={repo}>GitHub</a>
        </div>
      </footer>
    </div>
  );
}

const root = document.getElementById('app');

if (!root) {
  throw new Error('Elemento raiz da landing page não encontrado.');
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
