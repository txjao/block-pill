import { Brand } from '@/shared/ui/components/brand';
import styles from '../styles/popup.module.css';

interface PopupHeaderProps {
  onOpenSettings: () => void;
}

export function PopupHeader({ onOpenSettings }: PopupHeaderProps) {
  return (
    <header class={styles.header}>
      <Brand />
      <button type="button" onClick={onOpenSettings}>
        Configurações
      </button>
    </header>
  );
}
