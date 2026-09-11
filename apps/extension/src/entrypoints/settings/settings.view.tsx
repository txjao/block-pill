import type { useSettingsModel } from './settings.model';
import { ActivityDashboardPage } from '@/features/activity';
import { AntiModePage } from '@/features/anti-mode';
import { PermanentBlockPage } from '@/features/permanent-block';
import { StandardBlockPage } from '@/features/standard-block';
import { ReflectionsPage } from '@/features/reflections';
import { Brand } from '@/shared/ui/components/brand';
import { HoverUnderline } from '@/shared/ui/components/hover-underline';
import { Tabs, TabsContent } from '@/shared/ui/components/tabs';
import styles from './styles/settings.module.css';

type SettingsModel = ReturnType<typeof useSettingsModel>;

export function SettingsView(props: SettingsModel) {
  const {
    sections,
    section,
    blocksTab,
    selectedMode,
    standardCount,
    permanentCount,
    highlightedHostname,
    permanentHostname,
    openPermanentConfirmation,
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
              {item.id === 'anti' && (
                <div class={styles.submenu}>
                  <div class={styles.submenuInner}>
                    <button
                      class={
                        selectedMode === 'anti-porn' ? styles.submenuActive : ''
                      }
                      type="button"
                      onClick={() => selectMode('anti-porn')}
                    >
                      <span>Anti-pornografia</span>
                      <small>configurar</small>
                    </button>
                    <button
                      class={
                        selectedMode === 'anti-bet' ? styles.submenuActive : ''
                      }
                      type="button"
                      onClick={() => selectMode('anti-bet')}
                    >
                      <span>Anti-aposta</span>
                      <small>configurar</small>
                    </button>
                  </div>
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
              <p>
                Crie pausas flexíveis ou registre decisões que você não quer
                renegociar.
              </p>
            </header>
            <Tabs
              value={blocksTab}
              onValueChange={setBlocksTab}
              items={[
                {
                  value: 'flexible',
                  label: 'Pausas flexíveis',
                  count: standardCount,
                },
                {
                  value: 'permanent',
                  label: 'Decisões permanentes',
                  count: permanentCount,
                },
              ]}
              note={
                blocksTab === 'flexible'
                  ? '15 min por ciclo · liberação manual'
                  : 'não podem ser removidas por aqui'
              }
            >
              <TabsContent value="flexible">
                <StandardBlockPage
                  initialHighlightedHostname={highlightedHostname}
                  onCountChange={setStandardCount}
                />
              </TabsContent>
              <TabsContent value="permanent">
                <PermanentBlockPage
                  initialHostname={permanentHostname}
                  confirmationInitiallyOpen={openPermanentConfirmation}
                  onCountChange={setPermanentCount}
                />
              </TabsContent>
            </Tabs>
          </>
        )}
        {section === 'anti' &&
          (selectedMode ? (
            <AntiModePage selectedMode={selectedMode} />
          ) : (
            <section class={styles.antiIndex}>
              <header class={styles.pageHeader}>
                <h1>Modos anti</h1>
                <p>Um compromisso para proteger o que importa para você.</p>
              </header>
              <p>
                Escolha uma proteção e defina por quanto tempo quer mantê-la.
                Durante o compromisso, o modo não pode ser desativado. Você
                também pode escolher um compromisso sem prazo.
              </p>
              <p>
                Sites de bloqueio explícito não oferecem acesso temporário. Nos
                sites com aviso, você pode escolher um período curto de acesso.
                Tudo funciona localmente no seu navegador.
              </p>
              <nav class={styles.modeLinks} aria-label="Escolher modo anti">
                <button type="button" onClick={() => selectMode('anti-porn')}>
                  <strong>
                    <HoverUnderline className={styles.modeLinkTitle}>
                      Anti-pornografia
                    </HoverUnderline>
                  </strong>
                  <span>Configure a proteção contra conteúdo adulto.</span>
                </button>
                <button type="button" onClick={() => selectMode('anti-bet')}>
                  <strong>
                    <HoverUnderline className={styles.modeLinkTitle}>
                      Anti-aposta
                    </HoverUnderline>
                  </strong>
                  <span>Configure a proteção contra apostas.</span>
                </button>
              </nav>
            </section>
          ))}
        {section === 'reflections' && <ReflectionsPage />}
        {section === 'activity' && (
          <div class={styles.legacyActivity}>
            <ActivityDashboardPage />
          </div>
        )}
      </section>
    </main>
  );
}
