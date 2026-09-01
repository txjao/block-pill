import { usePopupModel } from './popup.model';
import { PopupView } from './popup.view';

export function PopupPage() {
  const model = usePopupModel();
  return <PopupView {...model} />;
}
