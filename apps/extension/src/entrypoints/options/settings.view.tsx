import type { useSettingsModel } from './settings.model';
import { ActivityDashboardPage } from '../../features/activity';
import { AntiModePage } from '../../features/anti-mode';
import { PermanentBlockPage } from '../../features/permanent-block';
import { StandardBlockPage } from '../../features/standard-block';
import { Brand } from '../../shared/ui/components/brand/brand';
import { Tabs, TabsContent } from '../../shared/ui/components/tabs/tabs';
import styles from './settings.module.css';

type SettingsModel = ReturnType<typeof useSettingsModel>;

const sections = [
  { id: 'blocking', label: 'Bloqueios', hint: 'Flexíveis e permanentes' },
  { id: 'anti', label: 'Modos anti', hint: 'Compromissos de proteção' },
  { id: 'activity', label: 'Atividade', hint: 'Registros locais' },
] as const;

export function SettingsView(props: SettingsModel) {
  const {
    section,
    blocksTab,
    selectedMode,
    standardCount,
    permanentCount,
    selectSection,
    setBlocksTab,
    selectMode,
    setStandardCount,
    setPermanentCount,
  } = props;

  return (
    <main class={styles.shell}>
      <aside class={styles.sidebar}>
        <Brand />
        <nav class={styles.navigation} aria-label="Seções das configurações">
          {sections.map((item) => (
            <div key={item.id}>
              <button
                class={`${styles.navigationItem} ${section === item.id ? styles.active : ''}`}
                type="button"
                aria-current={section === item.id ? 'page' : undefined}
                onClick={() => selectSection(item.id)}
              >
                <strong>{item.label}</strong>
                <small>{item.hint}</small>
              </button>
              {item.id === 'anti' && section === 'anti' && (
                <div class={styles.submenu}>
                  <button
                    class={selectedMode === 'anti-porn' ? styles.submenuActive : ''}
                    type="button"
                    onClick={() => selectMode('anti-porn')}
                  >
                    <span>Anti-pornografia</span>
                    <small>configurar</small>
                  </button>
                  <button
                    class={selectedMode === 'anti-bet' ? styles.submenuActive : ''}
                    type="button"
                    onClick={() => selectMode('anti-bet')}
                  >
                    <span>Anti-aposta</span>
                    <small>configurar</small>
                  </button>
                </div>
              )}
            </div>
          ))}
        </nav>
        <p class={styles.sidebarFooter}>
          Tudo fica neste navegador.
          <small>Nenhum dado sai do seu dispositivo.</small>
        </p>
      </aside>

      <section class={styles.content}>
        {section === 'blocking' && (
          <>
            <header class={styles.pageHeader}>
              <h1>Bloqueios</h1>
              <p>Crie pausas flexíveis ou registre decisões que você não quer renegociar.</p>
            </header>
            <Tabs
              value={blocksTab}
              onValueChange={setBlocksTab}
              items={[
                { value: 'flexible', label: 'Pausas flexíveis', count: standardCount },
                { value: 'permanent', label: 'Decisões permanentes', count: permanentCount },
              ]}
              note={
                blocksTab === 'flexible'
                  ? '15 min por ciclo · liberação manual'
                  : 'não podem ser removidas por aqui'
              }
            >
              <TabsContent value="flexible">
                <StandardBlockPage onCountChange={setStandardCount} />
              </TabsContent>
              <TabsContent value="permanent">
                <PermanentBlockPage onCountChange={setPermanentCount} />
              </TabsContent>
            </Tabs>
          </>
        )}
        {section === 'anti' && <AntiModePage selectedMode={selectedMode} />}
        {section === 'activity' && (
          <div class={styles.legacyActivity}>
            <ActivityDashboardPage />
          </div>
        )}
      </section>
    </main>
  );
}
