import type {
  StandardBlock,
  StandardBlockRuleManager
} from "../../../modules/standard-blocking";
import {
  STANDARD_BLOCK_RULE_ID_END,
  STANDARD_BLOCK_RULE_ID_START
} from "../../../modules/standard-blocking";

const BLOCKED_PAGE_PATH = "/src/entrypoints/blocked/index.html";

export function createStandardBlockRule(
  block: StandardBlock
): chrome.declarativeNetRequest.Rule {
  return {
    id: block.ruleId,
    priority: 1,
    action: {
      type: "redirect",
      redirect: { extensionPath: BLOCKED_PAGE_PATH }
    },
    condition: {
      requestDomains: [block.hostname],
      resourceTypes: ["main_frame"]
    }
  };
}

export class ChromeStandardBlockRuleManager
  implements StandardBlockRuleManager
{
  async replaceAll(blocks: StandardBlock[]): Promise<void> {
    const dynamicRules = await chrome.declarativeNetRequest.getDynamicRules();
    const standardRuleIds = dynamicRules
      .map((rule) => rule.id)
      .filter(
        (ruleId) =>
          ruleId >= STANDARD_BLOCK_RULE_ID_START &&
          ruleId <= STANDARD_BLOCK_RULE_ID_END
      );

    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: standardRuleIds,
      addRules: blocks.map(createStandardBlockRule)
    });
  }
}
