import icon from '@workspace/shared/brand/icons/block-pill-transparent.svg?url';
import { repo } from '@/content';

export function Logo() {
  return (
    <a className="logo" href="#top" aria-label="Block Pill, início">
      <img src={icon} width="42" height="42" alt="" />
      <span>Block Pill</span>
    </a>
  );
}

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Logo />
        <nav aria-label="Navegação principal">
          <a className="motion-link nav-link" href="#como">
            Como funciona
          </a>
          <a className="motion-link nav-link" href="#principios">
            Princípios
          </a>
          <a className="nav-cta" href={repo} target="_blank" rel="noreferrer">
            GitHub <span aria-hidden="true">↗</span>
          </a>
        </nav>
      </div>
    </header>
  );
}
