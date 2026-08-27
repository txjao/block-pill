import { usePermanentBlockModel } from './permanent-block.model';
import { PermanentBlockView } from './permanent-block.view';

export function PermanentBlockPage() {
  const model = usePermanentBlockModel();
  return <PermanentBlockView {...model} />;
}
