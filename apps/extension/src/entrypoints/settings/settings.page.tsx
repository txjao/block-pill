import { useSettingsModel } from './settings.model';
import { SettingsView } from './settings.view';
import {
  consumedSettingsParameters,
  readSettingsRequest,
} from './settings.request';

const settingsUrl = new URL(window.location.href);
const request = readSettingsRequest(settingsUrl.search);

consumedSettingsParameters.forEach((parameter) =>
  settingsUrl.searchParams.delete(parameter),
);

history.replaceState(
  null,
  '',
  `${settingsUrl.pathname}${settingsUrl.search}${settingsUrl.hash}`,
);

export function SettingsPage() {
  const model = useSettingsModel({
    requestedSection: request.section,
    requestedBlocksTab: request.tab,
    requestedMode: request.mode,
    highlightedHostname: request.highlightedHostname,
    permanentHostname: request.permanentHostname,
    openPermanentConfirmation: request.openPermanentConfirmation,
  });
  return <SettingsView {...model} />;
}
