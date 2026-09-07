import { useSettingsModel } from './settings.model';
import { SettingsView } from './settings.view';

const settingsUrl = new URL(window.location.href);
const requestedSection = settingsUrl.searchParams.get('section');
settingsUrl.searchParams.delete('section');
history.replaceState(
  null,
  '',
  `${settingsUrl.pathname}${settingsUrl.search}${settingsUrl.hash}`,
);

export function SettingsPage() {
  const model = useSettingsModel({ requestedSection });
  return <SettingsView {...model} />;
}
