import { describe, expect, it } from 'vitest';
import { createAntiModeRules } from '@/features/anti-mode/infrastructure/anti-mode.rule-manager.chrome';
import type { AntiModeConfig } from '@/features/anti-mode/domain/anti-mode.types';

const config: AntiModeConfig = {
  id: 'anti-porn',
  enabled: true,
  permanent: false,
  goals: [],
  hobbies: [],
  philosophicalKnowledge: false,
  domains: ['adult.example'],
  warningDomains: ['x.com'],
  accessUntilByHostname: {},
};

describe('anti mode chrome rules', () => {
  it('prioriza a tela anti e bloqueia subdomínios', () => {
    const rules = createAntiModeRules(
      [config],
      1_000,
      (path) => `chrome-extension://test/${path}`,
    );
    expect(rules).toHaveLength(2);
    expect(rules[0]).toMatchObject({
      priority: 3,
      condition: { requestDomains: ['adult.example'] },
    });
  });

  it('remove temporariamente a regra de um domínio de gatilho liberado', () => {
    const rules = createAntiModeRules(
      [{ ...config, accessUntilByHostname: { 'x.com': 5_000 } }],
      1_000,
      (path) => `chrome-extension://test/${path}`,
    );
    expect(rules).toHaveLength(1);
  });
});
