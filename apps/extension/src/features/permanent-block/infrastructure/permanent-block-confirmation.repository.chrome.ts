import { PERMANENT_BLOCK_CONFIRMATION_STORAGE_KEY } from '@/features/permanent-block/domain/permanent-block-confirmation.constants';
import type { PermanentBlockConfirmationRepository } from '@/features/permanent-block/domain/permanent-block-confirmation.repository';

export class ChromePermanentBlockConfirmationRepository implements PermanentBlockConfirmationRepository {
  async getEnabled(): Promise<boolean> {
    const stored = await chrome.storage.local.get(
      PERMANENT_BLOCK_CONFIRMATION_STORAGE_KEY,
    );
    const enabled: unknown = stored[PERMANENT_BLOCK_CONFIRMATION_STORAGE_KEY];
    return typeof enabled === 'boolean' ? enabled : true;
  }

  async setEnabled(enabled: boolean): Promise<void> {
    await chrome.storage.local.set({
      [PERMANENT_BLOCK_CONFIRMATION_STORAGE_KEY]: enabled,
    });
  }
}
