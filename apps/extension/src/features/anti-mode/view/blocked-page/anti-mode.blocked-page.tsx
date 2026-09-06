import { PageBrand } from '@/shared/ui/components/page-brand';
import { useAntiModeBlockedModel } from './anti-mode.blocked-model';
import { AntiModeBlockedView } from './anti-mode.blocked-view';
import styles from './anti-mode.blocked.module.css';

export function AntiModeBlockedPage() {
  const model = useAntiModeBlockedModel();
  return (
    <main class={styles.page}>
      <PageBrand title="Block Pill" />
      <AntiModeBlockedView {...model} />
    </main>
  );
}
