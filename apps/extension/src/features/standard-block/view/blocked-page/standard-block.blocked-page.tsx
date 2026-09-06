import { PageBrand } from '@/shared/ui/components/page-brand';
import { useStandardBlockBlockedModel } from './standard-block.blocked-model';
import { StandardBlockBlockedView } from './standard-block.blocked-view';
import styles from './standard-block.blocked.module.css';

export function StandardBlockBlockedPage() {
  const model = useStandardBlockBlockedModel();

  return (
    <main class={styles.page}>
      <PageBrand title="Site bloqueado" />
      <StandardBlockBlockedView {...model} />
    </main>
  );
}
