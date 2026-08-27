import { describe, expect, it } from 'vitest';
import type { Clock } from '../../../shared/time/clock';
import { PERMANENT_BLOCK_RULE_ID_START } from '../domain/permanent-block.constants';
import type { PermanentBlockRepository } from '../domain/permanent-block.repository';
import type { PermanentBlockRuleManager } from '../domain/permanent-block.rule-manager';
import {
  PermanentBlockAlreadyExistsError,
  PermanentBlockService,
} from '../domain/permanent-block.service';
import type { PermanentBlock } from '../domain/permanent-block.types';

class MemoryRepository implements PermanentBlockRepository {
  blocks: PermanentBlock[] = [];

  async getAll() {
    return structuredClone(this.blocks);
  }

  async setAll(blocks: PermanentBlock[]) {
    this.blocks = structuredClone(blocks);
  }
}

class MemoryRuleManager implements PermanentBlockRuleManager {
  blocks: PermanentBlock[] = [];
  shouldFail = false;

  async replaceAll(blocks: PermanentBlock[]) {
    if (this.shouldFail) {
      throw new Error('Falha ao atualizar regras permanentes.');
    }

    this.blocks = structuredClone(blocks);
  }
}

const clock: Clock = { now: () => 123_456 };

function createFixture() {
  const repository = new MemoryRepository();
  const rules = new MemoryRuleManager();
  const service = new PermanentBlockService(repository, rules, clock);

  return { repository, rules, service };
}

describe('permanent block', () => {
  it('cria um bloqueio sem oferecer operação de remoção', async () => {
    const { service } = createFixture();

    await expect(service.add('https://www.example.com/path')).resolves.toEqual({
      hostname: 'example.com',
      ruleId: PERMANENT_BLOCK_RULE_ID_START,
      createdAt: 123_456,
    });
    expect('remove' in service).toBe(false);
  });

  it('rejeita o mesmo domínio normalizado duas vezes', async () => {
    const { service } = createFixture();
    await service.add('example.com');

    await expect(service.add('www.example.com')).rejects.toBeInstanceOf(
      PermanentBlockAlreadyExistsError,
    );
  });

  it('restaura o armazenamento se as regras falharem', async () => {
    const { repository, rules, service } = createFixture();
    rules.shouldFail = true;

    await expect(service.add('example.com')).rejects.toThrow(
      'Falha ao atualizar regras permanentes.',
    );
    expect(repository.blocks).toEqual([]);
  });
});
