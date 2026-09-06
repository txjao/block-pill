import { permanentBlockSchema } from '@/features/permanent-block/domain/permanent-block.schema';
import type { PermanentBlockRepository } from '@/features/permanent-block/domain/permanent-block.repository';
import type { PermanentBlock } from '@/features/permanent-block/domain/permanent-block.types';

const STORAGE_KEY = 'permanentBlocks';

export class ChromePermanentBlockRepository implements PermanentBlockRepository {
  async getAll(): Promise<PermanentBlock[]> {
    const stored = await chrome.storage.local.get(STORAGE_KEY);
    const value: unknown = stored[STORAGE_KEY];

    if (!Array.isArray(value)) return [];

    const blocks: PermanentBlock[] = [];
    const hostnames = new Set<string>();
    const ruleIds = new Set<number>();

    for (const candidate of value) {
      const result = permanentBlockSchema.safeParse(candidate);
      if (!result.success) continue;
      if (hostnames.has(result.data.hostname) || ruleIds.has(result.data.ruleId)) {
        continue;
      }

      hostnames.add(result.data.hostname);
      ruleIds.add(result.data.ruleId);
      blocks.push(result.data);
    }

    return blocks.sort((left, right) => left.hostname.localeCompare(right.hostname));
  }

  async setAll(blocks: PermanentBlock[]): Promise<void> {
    await chrome.storage.local.set({ [STORAGE_KEY]: blocks });
  }
}
