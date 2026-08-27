import { describe, expect, it } from 'vitest';
import { standardBlockSchema } from '../domain/standard-block.schema';

describe('standard block schema', () => {
  it('migra um registro legado com os padrões da nova regra', () => {
    expect(standardBlockSchema.parse({ hostname: 'youtube.com', ruleId: 1 })).toEqual({
      hostname: 'youtube.com',
      ruleId: 1,
      createdAt: 0,
      allowedSubdomains: [],
      temporaryAccess: { usedMinutes: 0 },
    });
  });

  it('rejeita estado de acesso acima do orçamento', () => {
    expect(() =>
      standardBlockSchema.parse({
        hostname: 'youtube.com',
        ruleId: 1,
        temporaryAccess: { usedMinutes: 16 },
      }),
    ).toThrow();
  });
});
