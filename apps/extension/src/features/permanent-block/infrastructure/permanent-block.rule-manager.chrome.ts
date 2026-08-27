import {
  PERMANENT_BLOCK_RULE_ID_END,
  PERMANENT_BLOCK_RULE_ID_START,
} from '../domain/permanent-block.constants';
import type { PermanentBlockRuleManager } from '../domain/permanent-block.rule-manager';
import type { PermanentBlock } from '../domain/permanent-block.types';

const BLOCKED_PAGE_PATH = 'src/entrypoints/blocked/index.html';

export function createPermanentBlockRule(
  block: PermanentBlock,
  resolveUrl: (path: string) => string = chrome.runtime.getURL,
): chrome.declarativeNetRequest.Rule {
  return {
    id: block.ruleId,
    priority: 2,
    action: {
      type: 'redirect',
      redirect: {
        url: resolveUrl(
          `${BLOCKED_PAGE_PATH}?mode=permanent&hostname=${encodeURIComponent(block.hostname)}`,
        ),
      },
    },
    condition: {
      requestDomains: [block.hostname],
      resourceTypes: ['main_frame'],
    },
  };
}

export class ChromePermanentBlockRuleManager implements PermanentBlockRuleManager {
  async replaceAll(blocks: PermanentBlock[]): Promise<void> {
    const dynamicRules = await chrome.declarativeNetRequest.getDynamicRules();
    const ruleIds = dynamicRules
      .map((rule) => rule.id)
      .filter(
        (ruleId) =>
          ruleId >= PERMANENT_BLOCK_RULE_ID_START && ruleId <= PERMANENT_BLOCK_RULE_ID_END,
      );

    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: ruleIds,
      addRules: blocks.map((block) => createPermanentBlockRule(block)),
    });
  }
}
