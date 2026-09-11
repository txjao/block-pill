import { describe, expect, it } from 'vitest';
import { PERMANENT_BLOCK_RULE_ID_START } from '@/features/permanent-block/domain/permanent-block.constants';
import { permanentBlockSchema } from '@/features/permanent-block/domain/permanent-block.schema';

describe('permanent block schema', () => {
  it('normaliza e valida um registro permanente', () => {
    expect(
      permanentBlockSchema.parse({
        hostname: 'www.example.com',
        ruleId: PERMANENT_BLOCK_RULE_ID_START,
        createdAt: 1,
      }),
    ).toEqual({
      hostname: 'example.com',
      ruleId: PERMANENT_BLOCK_RULE_ID_START,
      createdAt: 1,
    });
  });
});
