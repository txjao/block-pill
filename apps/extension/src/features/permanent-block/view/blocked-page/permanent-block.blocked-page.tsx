import { useMemo } from 'preact/hooks';
import { usePermanentBlockBlockedModel } from './permanent-block.blocked-model';
import { PermanentBlockBlockedView } from './permanent-block.blocked-view';

export function PermanentBlockBlockedPage() {
  const hostname = useMemo(
    () => new URLSearchParams(window.location.search).get('hostname'),
    [],
  );
  const model = usePermanentBlockBlockedModel({ hostname });
  return <PermanentBlockBlockedView {...model} />;
}
