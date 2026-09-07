import { useCreateBlockModel } from '@/entrypoints/blocked/blocked.model';
import { BlockedView } from './blocked.view';

const mode = new URLSearchParams(window.location.search).get('mode');

export function BlockedPage() {
  const model = useCreateBlockModel({ mode });
  return <BlockedView {...model} />;
}
