import { parseHostname } from "../../../modules/site/hostname";
import type {
  StandardBlock,
  StandardBlockStore
} from "../../../modules/standard-blocking";
import {
  STANDARD_BLOCK_RULE_ID_END,
  STANDARD_BLOCK_RULE_ID_START
} from "../../../modules/standard-blocking";

const STORAGE_KEY = "standardBlocks";

export class ChromeStandardBlockStore implements StandardBlockStore {
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
      if (
        typeof candidate !== "object" ||
        candidate === null ||
        !("hostname" in candidate) ||
        typeof candidate.hostname !== "string" ||
        !("ruleId" in candidate) ||
        typeof candidate.ruleId !== "number" ||
        !Number.isInteger(candidate.ruleId) ||
        candidate.ruleId < STANDARD_BLOCK_RULE_ID_START ||
        candidate.ruleId > STANDARD_BLOCK_RULE_ID_END
      ) {
        continue;
      }

      try {
        const hostname = parseHostname(candidate.hostname);

        if (hostnames.has(hostname) || ruleIds.has(candidate.ruleId)) {
          continue;
        }

        hostnames.add(hostname);
        ruleIds.add(candidate.ruleId);
        blocks.push({ hostname, ruleId: candidate.ruleId });
      } catch {
        continue;
      }
    }

    return blocks;
  }

  async setAll(blocks: StandardBlock[]): Promise<void> {
    await chrome.storage.local.set({ [STORAGE_KEY]: blocks });
  }
}
