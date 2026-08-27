import { useStandardBlockModel } from './standard-block.model';
import { StandardBlockView } from './standard-block.view';

export function StandardBlockPage() {
  const model = useStandardBlockModel();

  return (
    <>
      <StandardBlockView {...model} />
    </>
  );
}
