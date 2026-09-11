import type { useInterfacePreviewModel } from './interface-preview.model';
import styles from './styles/interface-preview.module.css';

type InterfacePreviewModel = ReturnType<typeof useInterfacePreviewModel>;

export function InterfacePreviewView({
  frameHeight,
  frameTitle,
  frameUrl,
  frameWidth,
  options,
  reloadPreview,
  selectedId,
  selectPreview,
  commitmentState,
  setCommitmentState,
}: InterfacePreviewModel) {
  return (
    <main class={styles.page}>
      <header class={styles.toolbar}>
        <div>
          <strong>Interfaces da extensão</strong>
          <small>Ambiente local com dados simulados</small>
        </div>
        <label class={styles.selector}>
          <span>Interface</span>
          <select value={selectedId} onChange={selectPreview}>
            {options.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        {commitmentState && (
          <label class={styles.selector}>
            <span>Estado simulado</span>
            <select
              value={commitmentState}
              onChange={(event) =>
                setCommitmentState(event.currentTarget.value)
              }
            >
              <option value="inactive">
                Sem compromisso — mostrar formulário
              </option>
              <option value="ongoing">Compromisso ativo</option>
            </select>
          </label>
        )}
        <button type="button" onClick={reloadPreview}>
          Reiniciar interface
        </button>
      </header>

      <section class={styles.stage} aria-label={`Visualização: ${frameTitle}`}>
        <iframe
          class={styles.frame}
          height={frameHeight}
          src={frameUrl}
          style={{ width: `${frameWidth}px` }}
          title={frameTitle}
        />
      </section>
    </main>
  );
}
