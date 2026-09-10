import type { AntiModeId } from '@/features/anti-mode';
import type { BlocksTab, SettingsSection } from './settings.model';
import { parseHostname } from '@/shared/web-address/domain';

export interface SettingsRequest {
  section: SettingsSection;
  tab: BlocksTab;
  mode?: AntiModeId;
  highlightedHostname?: string;
  permanentHostname?: string;
  openPermanentConfirmation: boolean;
}

export function readSettingsRequest(search: string): SettingsRequest {
  const parameters = new URLSearchParams(search);
  const section = readSection(parameters.get('section'));
  const tab = parameters.get('tab') === 'permanent' ? 'permanent' : 'flexible';
  const mode = readMode(parameters.get('mode'));
  const highlightedHostname = readHostname(parameters.get('highlight'));
  const permanentHostname = readHostname(parameters.get('hostname'));

  return {
    section,
    tab,
    mode,
    highlightedHostname,
    permanentHostname,
    openPermanentConfirmation:
      tab === 'permanent' &&
      parameters.get('confirm') === 'permanent' &&
      permanentHostname !== undefined,
  };
}

function readSection(value: string | null): SettingsSection {
  return value === 'anti' || value === 'activity' || value === 'reflections'
    ? value
    : 'blocking';
}

function readMode(value: string | null): AntiModeId | undefined {
  return value === 'anti-porn' || value === 'anti-bet' ? value : undefined;
}

function readHostname(value: string | null): string | undefined {
  if (!value) return undefined;
  try {
    return parseHostname(value);
  } catch {
    return undefined;
  }
}

export const consumedSettingsParameters = [
  'section',
  'tab',
  'mode',
  'highlight',
  'hostname',
  'confirm',
] as const;
