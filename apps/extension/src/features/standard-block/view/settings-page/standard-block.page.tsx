import { useEffect } from 'preact/hooks';
import { useStandardBlockModel } from './standard-block.model';
import { StandardBlockView } from './standard-block.view';

export function StandardBlockPage({ onCountChange }: { onCountChange?: (count: number) => void }) {
  const model = useStandardBlockModel();

  useEffect(() => onCountChange?.(model.blocks.length), [model.blocks.length, onCountChange]);

  return <StandardBlockView {...model} />;
}
