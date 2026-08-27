import { Brand } from '../../../shared/ui/brand';
import { useStandardBlockBlockedModel } from './standard-block.blocked-model';
import { StandardBlockBlockedView } from './standard-block.blocked-view';

export function StandardBlockBlockedPage() {
  const model = useStandardBlockBlockedModel();

  return (
    <main>
      <Brand title="Site bloqueado" />
      <StandardBlockBlockedView {...model} />
    </main>
  );
}
