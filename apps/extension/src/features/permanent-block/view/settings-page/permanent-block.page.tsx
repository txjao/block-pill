import { useEffect } from 'preact/hooks';
import { usePermanentBlockModel } from './permanent-block.model';
import { PermanentBlockView } from './permanent-block.view';

export function PermanentBlockPage({
  onCountChange,
}: {
  onCountChange?: (count: number) => void;
}) {
  const model = usePermanentBlockModel();

  useEffect(
    () => onCountChange?.(model.blocks.length),
    [model.blocks.length, onCountChange],
  );

  return <PermanentBlockView {...model} />;
}
