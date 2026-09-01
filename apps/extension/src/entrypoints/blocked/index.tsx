import { StandardBlockBlockedPage } from '../../features/standard-block';
import { PermanentBlockBlockedPage } from '../../features/permanent-block';
import { AntiModeBlockedPage } from '../../features/anti-mode';
import type { ComponentChild } from 'preact';
import { renderPage } from '../../shared/ui/render-page';
import '../../shared/ui/base.css';
import '../../shared/ui/design-system.css';
import '../../shared/ui/feature-overrides.css';
import '../../shared/ui/anti-dashboard.css';

const mode = new URLSearchParams(window.location.search).get('mode');

renderPage(resolveBlockedPage(mode));

function resolveBlockedPage(blockMode: string | null): ComponentChild {
  if (blockMode === 'anti-porn' || blockMode === 'anti-bet') {
    return <AntiModeBlockedPage />;
  }

  if (blockMode === 'permanent') {
    return <PermanentBlockBlockedPage />;
  }

  return <StandardBlockBlockedPage />;
}
