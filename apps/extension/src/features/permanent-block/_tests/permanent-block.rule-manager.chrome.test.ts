import { describe, expect, it } from 'vitest';
import { createPermanentBlockRule } from '@/features/permanent-block/infrastructure/permanent-block.rule-manager.chrome';

describe('permanent block chrome rule', () => {
  it('usa prioridade superior ao bloqueio padrão e não cria exceções', () => {
    const rule = createPermanentBlockRule(
      { hostname: 'example.com' as never, ruleId: 1_000_000, createdAt: 1 },
      (path) => `chrome-extension://test/${path}`,
    );
    expect(rule.priority).toBe(2);
    expect(rule.condition.requestDomains).toEqual(['example.com']);
    expect(rule.condition.excludedRequestDomains).toBeUndefined();
  });
});
