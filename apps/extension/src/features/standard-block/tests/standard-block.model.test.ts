import { describe, expect, it } from 'vitest';
import { parseHostname } from '@/shared/web-address/domain';
import { createStandardBlockRows } from '@/features/standard-block/view/settings-page/standard-block.model';

const block = {
  hostname: parseHostname('example.com'),
  ruleId: 1,
  createdAt: 1,
  allowedSubdomains: [],
  temporaryAccess: { usedMinutes: 0 },
};

describe('standard block model', () => {
  it('uses the global cooldown when the domain has no override', () => {
    expect(createStandardBlockRows([block], '12')[0]?.cooldownLabel).toBe('espera geral de 12 h');
  });

  it('shows a domain-specific cooldown in hours', () => {
    expect(
      createStandardBlockRows([{ ...block, cooldownMilliseconds: 7_200_000 }], '12')[0]
        ?.cooldownLabel,
    ).toBe('espera própria de 2 h');
  });
});
