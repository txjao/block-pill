import { AntiModeBlockedPage } from '@/features/anti-mode';
import { PermanentBlockBlockedPage } from '@/features/permanent-block';
import { StandardBlockBlockedPage } from '@/features/standard-block';

export function createBlockedModel() {
  const mode = new URLSearchParams(window.location.search).get('mode');

  if (mode === 'anti-porn' || mode === 'anti-bet') {
    return { Page: AntiModeBlockedPage };
  }

  if (mode === 'permanent') {
    return { Page: PermanentBlockBlockedPage };
  }

  return { Page: StandardBlockBlockedPage };
}
