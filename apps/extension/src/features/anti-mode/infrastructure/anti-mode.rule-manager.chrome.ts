import { ANTI_RULE_ID_END, ANTI_RULE_ID_START } from '../domain/anti-mode.constants';
import type { AntiModeRuleManager } from '../domain/anti-mode.rule-manager';
import type { AntiModeConfig } from '../domain/anti-mode.types';

const BLOCKED_PAGE_PATH = 'src/entrypoints/blocked/index.html';

export class ChromeAntiModeRuleManager implements AntiModeRuleManager {
  async replaceAll(configs: AntiModeConfig[], now: number): Promise<void> {
    const current = await chrome.declarativeNetRequest.getDynamicRules();
    const removeRuleIds = current
      .map((rule) => rule.id)
      .filter((id) => id >= ANTI_RULE_ID_START && id <= ANTI_RULE_ID_END);

    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds,
      addRules: createAntiModeRules(configs, now, chrome.runtime.getURL),
    });
  }
}

export function createAntiModeRules(
  configs: AntiModeConfig[],
  now: number,
  resolveUrl: (path: string) => string = chrome.runtime.getURL,
): chrome.declarativeNetRequest.Rule[] {
  const rules: chrome.declarativeNetRequest.Rule[] = [];
  let id = ANTI_RULE_ID_START;

  for (const config of configs.filter((candidate) => candidate.enabled)) {
    for (const hostname of config.domains) {
      rules.push(createRule(id, config.id, hostname, 'explicit', resolveUrl));
      id += 1;
    }
    for (const hostname of config.warningDomains) {
      if ((config.accessUntilByHostname[hostname] ?? 0) > now) continue;
      rules.push(createRule(id, config.id, hostname, 'warning', resolveUrl));
      id += 1;
    }
  }
  return rules;
}

function createRule(
  id: number,
  mode: string,
  hostname: string,
  kind: 'explicit' | 'warning',
  resolveUrl: (path: string) => string,
): chrome.declarativeNetRequest.Rule {
  return {
    id,
    priority: 3,
    action: {
      type: 'redirect',
      redirect: {
        url: resolveUrl(
          `${BLOCKED_PAGE_PATH}?mode=${mode}&kind=${kind}&hostname=${encodeURIComponent(hostname)}`,
        ),
      },
    },
    condition: { requestDomains: [hostname], resourceTypes: ['main_frame'] },
  };
}
