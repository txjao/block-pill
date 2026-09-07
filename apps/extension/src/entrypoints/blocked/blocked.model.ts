import { AntiModeBlockedPage } from '@/features/anti-mode';
import { PermanentBlockBlockedPage } from '@/features/permanent-block';
import { StandardBlockBlockedPage } from '@/features/standard-block';

export interface UseCreateBlockModelProps {
  mode: string | null;
}

export function useCreateBlockModel({ mode }: UseCreateBlockModelProps) {
  if (mode === 'anti-porn' || mode === 'anti-bet') {
    return { Page: AntiModeBlockedPage };
  }

  if (mode === 'permanent') {
    return { Page: PermanentBlockBlockedPage };
  }

  return { Page: StandardBlockBlockedPage };
}
