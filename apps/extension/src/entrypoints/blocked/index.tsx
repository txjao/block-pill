import { StandardBlockBlockedPage } from '../../features/standard-block';
import { PermanentBlockBlockedPage } from '../../features/permanent-block';
import { AntiModeBlockedPage } from '../../features/anti-mode';
import { renderPage } from '../../shared/ui/render-page';
import '../../shared/ui/base.css';
import '../../shared/ui/design-system.css';
import '../../shared/ui/feature-overrides.css';
import '../../shared/ui/anti-dashboard.css';

const mode = new URLSearchParams(window.location.search).get('mode');

renderPage(
  mode === 'anti-porn' || mode === 'anti-bet' ? (
    <AntiModeBlockedPage />
  ) : mode === 'permanent' ? (
    <PermanentBlockBlockedPage />
  ) : (
    <StandardBlockBlockedPage />
  ),
);
