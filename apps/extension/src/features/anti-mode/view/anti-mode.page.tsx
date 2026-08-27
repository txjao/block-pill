import { useAntiModeModel } from './anti-mode.model';
import { AntiModeView } from './anti-mode.view';

export function AntiModePage() {
  const model = useAntiModeModel();
  return <AntiModeView {...model} />;
}
