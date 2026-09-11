import { useInterfacePreviewModel } from './interface-preview.model';
import { InterfacePreviewView } from './interface-preview.view';

export function InterfacePreviewPage() {
  const model = useInterfacePreviewModel();
  return <InterfacePreviewView {...model} />;
}
