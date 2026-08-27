import { StandardBlockPage } from '../../features/standard-block';
import { PermanentBlockPage } from '../../features/permanent-block';
import { ActivityDashboardPage } from '../../features/activity';
import { AntiModePage } from '../../features/anti-mode';
import { useState } from 'preact/hooks';
import { Brand } from '../../shared/ui/brand';
import { renderPage } from '../../shared/ui/render-page';
import '../../shared/ui/base.css';
import '../../shared/ui/design-system.css';
import '../../shared/ui/feature-overrides.css';
import '../../shared/ui/anti-dashboard.css';

type SettingsSection = 'blocking' | 'anti' | 'activity';

function initialSection(): SettingsSection {
  const section = new URLSearchParams(window.location.search).get('section');
  return section === 'anti' || section === 'activity' ? section : 'blocking';
}

function SettingsApp() {
  const [section, setSection] = useState<SettingsSection>(initialSection);
  const sections: Array<{ id: SettingsSection; label: string; hint: string }> = [
    { id: 'blocking', label: 'Bloqueios', hint: 'Regras padrão e permanentes' },
    { id: 'anti', label: 'Modos anti', hint: 'Compromissos de proteção' },
    { id: 'activity', label: 'Atividade', hint: 'Registros locais por modo' },
  ];

  function selectSection(next: SettingsSection) {
    setSection(next);
    history.replaceState(null, '', `?section=${next}`);
  }

  return (
    <main class="settings-shell">
      <Brand title="Configurações" />
      <p class="page-intro">
        Defina onde o Block Pill cria uma pausa. Tudo é armazenado somente neste navegador.
      </p>
      <nav class="settings-nav" aria-label="Seções das configurações">
        {sections.map((item) => (
          <button
            key={item.id}
            class={section === item.id ? 'is-current' : 'secondary-button'}
            type="button"
            aria-current={section === item.id ? 'page' : undefined}
            onClick={() => selectSection(item.id)}
          >
            <span>{item.label}</span>
            <small>{item.hint}</small>
          </button>
        ))}
      </nav>
      <div class="settings-content">
        {section === 'blocking' && (
          <div class="blocking-stack">
            <StandardBlockPage />
            <PermanentBlockPage />
          </div>
        )}
        {section === 'anti' && <AntiModePage />}
        {section === 'activity' && <ActivityDashboardPage />}
      </div>
    </main>
  );
}

renderPage(<SettingsApp />);
