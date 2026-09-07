import { useState } from 'preact/hooks';
import type { AntiModeId } from '@/features/anti-mode';

export type SettingsSection = 'blocking' | 'anti' | 'activity';
export type BlocksTab = 'flexible' | 'permanent';

const settingsSections = [
  { id: 'blocking', label: 'Bloqueios', hint: 'Flexíveis e permanentes' },
  { id: 'anti', label: 'Modos anti', hint: 'Compromissos de proteção' },
  { id: 'activity', label: 'Atividade', hint: 'Registros locais' },
] as const;

export interface UseSettingsModelProps {
  requestedSection: string | null;
}

function normalizeSection(section: string | null): SettingsSection {
  return section === 'anti' || section === 'activity' ? section : 'blocking';
}

export function useSettingsModel({ requestedSection }: UseSettingsModelProps) {
  const [section, setSection] = useState<SettingsSection>(() =>
    normalizeSection(requestedSection),
  );
  const [blocksTab, setBlocksTab] = useState<BlocksTab>('flexible');
  const [selectedMode, setSelectedMode] = useState<AntiModeId>('anti-porn');
  const [standardCount, setStandardCount] = useState(0);
  const [permanentCount, setPermanentCount] = useState(0);

  function selectSection(next: SettingsSection): void {
    setSection(next);
  }

  function selectMode(mode: AntiModeId): void {
    setSelectedMode(mode);
    selectSection('anti');
  }

  return {
    sections: settingsSections,
    section,
    blocksTab,
    selectedMode,
    standardCount,
    permanentCount,
    selectSection,
    setBlocksTab,
    selectMode,
    setStandardCount,
    setPermanentCount,
  };
}
