import { createBlockedModel } from './blocked.model';
import { BlockedView } from './blocked.view';

export function BlockedPage() {
  const model = createBlockedModel();
  return <BlockedView {...model} />;
}
