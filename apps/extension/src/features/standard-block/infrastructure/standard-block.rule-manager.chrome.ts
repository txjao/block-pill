import {
  STANDARD_BLOCK_RULE_ID_END,
  STANDARD_BLOCK_RULE_ID_START,
} from '@/features/standard-block/domain/standard-block.constants';
import type { StandardBlockRuleManager } from '@/features/standard-block/domain/standard-block.rule-manager';
import type { StandardBlock } from '@/features/standard-block/domain/standard-block.types';

const BLOCKED_PAGE_PATH = 'src/entrypoints/blocked/index.html';

export function createStandardBlockRule(
  block: StandardBlock,
  resolveUrl: (path: string) => string = chrome.runtime.getURL,
): chrome.declarativeNetRequest.Rule {
  const condition: chrome.declarativeNetRequest.RuleCondition = {
    requestDomains: [block.hostname],
    resourceTypes: ['main_frame'],
  };

  if (block.allowedSubdomains.length > 0) {
    condition.excludedRequestDomains = block.allowedSubdomains;
  }

  return {
    id: block.ruleId,
    priority: 1,
    action: {
      type: 'redirect',
      redirect: {
        url: resolveUrl(
          `${BLOCKED_PAGE_PATH}?mode=standard&hostname=${encodeURIComponent(block.hostname)}`,
        ),
      },
    },
    condition,
  };
}

export class ChromeStandardBlockRuleManager implements StandardBlockRuleManager {
  async replaceAll(blocks: StandardBlock[]): Promise<void> {
    const dynamicRules = await chrome.declarativeNetRequest.getDynamicRules();
    const standardRuleIds = dynamicRules
      .map((rule) => rule.id)
      .filter(
        (ruleId) =>
          ruleId >= STANDARD_BLOCK_RULE_ID_START &&
          ruleId <= STANDARD_BLOCK_RULE_ID_END,
      );

    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: standardRuleIds,
      addRules: blocks.map((block) => createStandardBlockRule(block)),
    });
  }
}
