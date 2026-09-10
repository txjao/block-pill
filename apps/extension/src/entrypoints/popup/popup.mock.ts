export type PopupPreviewFixture =
  | { kind: 'outside' }
  | {
      kind: 'stimulating';
      hostname: string;
      timeToday: string;
      sinceInstallation: string;
    }
  | {
      kind: 'paused';
      hostname: string;
      remainingMinutes: number;
      blockType: string;
      releasesToday: string;
    };

const popupPreviewFixtures = {
  outside: { kind: 'outside' },
  stimulating: {
    kind: 'stimulating',
    hostname: 'instagram.com',
    timeToday: '1 h 24 min',
    sinceInstallation: '62 h · 41 dias',
  },
  paused: {
    kind: 'paused',
    hostname: 'twitter.com',
    remainingMinutes: 13,
    blockType: 'Flexível · 1 hora',
    releasesToday: '2 de 15 min',
  },
} satisfies Record<string, PopupPreviewFixture>;

export function readPopupPreview(
  search: string,
): PopupPreviewFixture | undefined {
  const preview = new URLSearchParams(search).get('preview');
  if (!preview || !(preview in popupPreviewFixtures)) return undefined;

  return popupPreviewFixtures[preview as keyof typeof popupPreviewFixtures];
}
