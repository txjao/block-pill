import { standardBlockSchema } from '@/features/standard-block/domain/standard-block.schema';
import {
  STANDARD_BLOCK_RULE_ID_END,
  STANDARD_BLOCK_RULE_ID_START,
} from '@/features/standard-block/domain/standard-block.constants';
import type { StandardBlockRepository } from '@/features/standard-block/domain/standard-block.repository';
import type { StandardBlock } from '@/features/standard-block/domain/standard-block.types';

const STORAGE_KEY = 'standardBlocks';

export class ChromeStandardBlockRepository implements StandardBlockRepository {
  async getAll(): Promise<StandardBlock[]> {
    const stored = await chrome.storage.local.get(STORAGE_KEY);
    const value: unknown = stored[STORAGE_KEY];

    if (!Array.isArray(value)) {
      return [];
    }

    const blocks: StandardBlock[] = [];
    const hostnames = new Set<string>();
    const ruleIds = new Set<number>();

    for (const candidate of value) {
      const result = standardBlockSchema.safeParse(candidate);

      if (!result.success) {
        continue;
      }

      const block = result.data;

      if (
        block.ruleId < STANDARD_BLOCK_RULE_ID_START ||
        block.ruleId > STANDARD_BLOCK_RULE_ID_END ||
        hostnames.has(block.hostname) ||
        ruleIds.has(block.ruleId)
      ) {
        continue;
      }

      hostnames.add(block.hostname);
      ruleIds.add(block.ruleId);
      blocks.push(block);
    }

    return blocks.sort((left, right) => left.hostname.localeCompare(right.hostname));
  }

  async setAll(blocks: StandardBlock[]): Promise<void> {
    await chrome.storage.local.set({ [STORAGE_KEY]: blocks });
  }
}
