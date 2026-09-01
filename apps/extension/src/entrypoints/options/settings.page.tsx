import { useSettingsModel } from './settings.model';
import { SettingsView } from './settings.view';

export function SettingsPage() {
  const model = useSettingsModel();
  return <SettingsView {...model} />;
}
