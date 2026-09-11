import { Brand } from '@/shared/ui/components/brand';
import styles from '@/entrypoints/popup/styles/popup.module.css';

interface PopupHeaderProps {
  onOpenSettings: () => void;
}

export function PopupHeader({ onOpenSettings }: PopupHeaderProps) {
  return (
    <header class={styles.header}>
      <Brand />
      <button
        type="button"
        aria-label="Abrir painel de configurações"
        onClick={onOpenSettings}
      >
        Painel
      </button>
    </header>
  );
}
