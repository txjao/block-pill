import { describe, expect, it } from 'vitest';
import { parseHostname } from '../../../shared/site/hostname';
import type { StandardBlock } from '../domain/standard-block.types';
import { createStandardBlockRule } from '../infrastructure/standard-block.rule-manager.chrome';

function createBlock(overrides: Partial<StandardBlock> = {}): StandardBlock {
  return {
    hostname: parseHostname('youtube.com'),
    ruleId: 7,
    createdAt: 1,
    allowedSubdomains: [],
    temporaryAccess: { usedMinutes: 0 },
    ...overrides,
  };
}

describe('standard block rule manager for Chrome', () => {
  it('redireciona o domínio e seus subdomínios', () => {
    expect(
      createStandardBlockRule(createBlock(), (path) => `chrome-extension://test/${path}`),
    ).toEqual({
      id: 7,
      priority: 1,
      action: {
        type: 'redirect',
        redirect: {
          url: 'chrome-extension://test/src/entrypoints/blocked/index.html?mode=standard&hostname=youtube.com',
        },
      },
      condition: {
        requestDomains: ['youtube.com'],
        resourceTypes: ['main_frame'],
      },
    });
  });

  it('preserva as exceções explícitas de subdomínio', () => {
    const rule = createStandardBlockRule(
      createBlock({ allowedSubdomains: [parseHostname('music.youtube.com')] }),
      (path) => `chrome-extension://test/${path}`,
    );

    expect(rule.condition.excludedRequestDomains).toEqual(['music.youtube.com']);
  });
});
