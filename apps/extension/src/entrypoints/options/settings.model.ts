import { useState } from 'preact/hooks';
import type { AntiModeId } from '@/features/anti-mode';

export type SettingsSection = 'blocking' | 'anti' | 'activity';
export type BlocksTab = 'flexible' | 'permanent';

function initialSection(): SettingsSection {
  const section = new URLSearchParams(window.location.search).get('section');
  return section === 'anti' || section === 'activity' ? section : 'blocking';
}

export function useSettingsModel() {
  const [section, setSection] = useState<SettingsSection>(initialSection);
  const [blocksTab, setBlocksTab] = useState<BlocksTab>('flexible');
  const [selectedMode, setSelectedMode] = useState<AntiModeId>('anti-porn');
  const [standardCount, setStandardCount] = useState(0);
  const [permanentCount, setPermanentCount] = useState(0);

  function selectSection(next: SettingsSection): void {
    setSection(next);
    history.replaceState(null, '', `?section=${next}`);
  }

  function selectMode(mode: AntiModeId): void {
    setSelectedMode(mode);
    selectSection('anti');
  }

  return {
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
