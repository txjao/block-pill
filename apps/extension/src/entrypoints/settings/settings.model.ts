import { useState } from 'preact/hooks';
import type { AntiModeId } from '@/features/anti-mode';

export type SettingsSection = 'blocking' | 'anti' | 'activity' | 'reflections';
export type BlocksTab = 'flexible' | 'permanent';

const settingsSections = [
  { id: 'blocking', label: 'Bloqueios', hint: 'Flexíveis e permanentes' },
  { id: 'anti', label: 'Modos anti', hint: 'Compromissos de proteção' },
  { id: 'activity', label: 'Atividade', hint: 'Registros locais' },
  { id: 'reflections', label: 'Reflexões', hint: 'Mensagens para suas pausas' },
] as const;

export interface UseSettingsModelProps {
  requestedSection: SettingsSection;
  requestedBlocksTab: BlocksTab;
  requestedMode?: AntiModeId;
  highlightedHostname?: string;
  permanentHostname?: string;
  openPermanentConfirmation: boolean;
}

export function useSettingsModel({
  requestedSection,
  requestedBlocksTab,
  requestedMode,
  highlightedHostname,
  permanentHostname,
  openPermanentConfirmation,
}: UseSettingsModelProps) {
  const [section, setSection] = useState<SettingsSection>(requestedSection);
  const [blocksTab, setBlocksTab] = useState<BlocksTab>(requestedBlocksTab);
  const [selectedMode, setSelectedMode] = useState<AntiModeId | undefined>(
    requestedMode,
  );
  const [standardCount, setStandardCount] = useState(0);
  const [permanentCount, setPermanentCount] = useState(0);

  function selectSection(next: SettingsSection): void {
    setSection(next);
    if (next === 'anti') setSelectedMode(undefined);
  }

  function selectMode(mode: AntiModeId): void {
    setSelectedMode(mode);
    setSection('anti');
  }

  return {
    sections: settingsSections,
    section,
    blocksTab,
    selectedMode,
    standardCount,
    permanentCount,
    highlightedHostname,
    permanentHostname,
    openPermanentConfirmation,
    selectSection,
    setBlocksTab,
    selectMode,
    setStandardCount,
    setPermanentCount,
  };
}
