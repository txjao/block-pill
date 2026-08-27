import { Brand } from '../../../shared/ui/brand';
import { useAntiModeBlockedModel } from './anti-mode.blocked-model';
import { AntiModeBlockedView } from './anti-mode.blocked-view';

export function AntiModeBlockedPage() {
  const model = useAntiModeBlockedModel();
  return (
    <main>
      <Brand title="Block Pill" />
      <AntiModeBlockedView {...model} />
    </main>
  );
}
