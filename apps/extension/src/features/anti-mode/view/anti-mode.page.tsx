import type { AntiModeId } from '../domain/anti-mode.types';
import { useAntiModeModel } from './anti-mode.model';
import { AntiModeView } from './anti-mode.view';

export function AntiModePage({ selectedMode }: { selectedMode?: AntiModeId } = {}) {
  const model = useAntiModeModel();
  return <AntiModeView {...model} selectedMode={selectedMode} />;
}
