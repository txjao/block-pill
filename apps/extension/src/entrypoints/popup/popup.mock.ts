export type PopupState = 'outside' | 'stimulating' | 'paused';

export interface PopupMockData {
  state: PopupState;
  releasesToday: string;
  pausedToday: string;
  sinceInstallation: string;
  remainingTime: string;
  blockType: string;
}

const allowedStates = new Set<PopupState>(['outside', 'stimulating', 'paused']);

export function createPopupMock(): PopupMockData {
  const preview = new URLSearchParams(window.location.search).get('preview') as PopupState | null;
  const state = preview && allowedStates.has(preview) ? preview : 'outside';

  return {
    state,
    releasesToday: '2 de 15 min',
    pausedToday: '1 h 24 min',
    sinceInstallation: '62 h · 41 dias',
    remainingTime: '08:12',
    blockType: 'Flexível · 15 min',
  };
}
