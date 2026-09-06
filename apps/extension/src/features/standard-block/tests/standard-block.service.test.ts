import { describe, expect, it } from 'vitest';
import type { Clock } from '@/shared/current-time/domain';
import { MINUTE_MS } from '@/features/standard-block/domain/standard-block.constants';
import type { StandardBlockRepository } from '@/features/standard-block/domain/standard-block.repository';
import type { StandardBlockRuleManager } from '@/features/standard-block/domain/standard-block.rule-manager';
import {
  InvalidCooldownError,
  StandardBlockAlreadyExistsError,
  StandardBlockService,
  TemporaryAccessBudgetError,
} from '@/features/standard-block/domain/standard-block.service';
import type { StandardBlock } from '@/features/standard-block/domain/standard-block.types';

class MemoryRepository implements StandardBlockRepository {
  blocks: StandardBlock[] = [];

  async getAll() {
    return structuredClone(this.blocks);
  }

  async setAll(blocks: StandardBlock[]) {
    this.blocks = structuredClone(blocks);
  }
}

class MemoryRuleManager implements StandardBlockRuleManager {
  blocks: StandardBlock[] = [];
  shouldFail = false;

  async replaceAll(blocks: StandardBlock[]) {
    if (this.shouldFail) {
      throw new Error('Falha ao atualizar regras.');
    }

    this.blocks = structuredClone(blocks);
  }
}

class MutableClock implements Clock {
  value = 1_000;

  now() {
    return this.value;
  }

  advance(milliseconds: number) {
    this.value += milliseconds;
  }
}

function createFixture() {
  const repository = new MemoryRepository();
  const rules = new MemoryRuleManager();
  const clock = new MutableClock();
  const service = new StandardBlockService(repository, rules, clock);

  return { repository, rules, clock, service };
}

describe('standard block', () => {
  it('adiciona, normaliza, lista e remove um domínio', async () => {
    const { repository, rules, service } = createFixture();

    await service.add('https://www.youtube.com/feed');

    await expect(service.list()).resolves.toEqual([
      {
        hostname: 'youtube.com',
        ruleId: 1,
        createdAt: 1_000,
        allowedSubdomains: [],
        cooldownMilliseconds: undefined,
        temporaryAccess: { usedMinutes: 0 },
      },
    ]);
    expect(rules.blocks).toEqual(repository.blocks);

    await service.remove('youtube.com');

    await expect(service.list()).resolves.toEqual([]);
    expect(rules.blocks).toEqual([]);
  });

  it('não permite cadastrar o mesmo domínio duas vezes', async () => {
    const { service } = createFixture();

    await service.add('youtube.com');

    await expect(service.add('www.youtube.com')).rejects.toBeInstanceOf(
      StandardBlockAlreadyExistsError,
    );
  });

  it('restaura o armazenamento quando a regra do navegador falha', async () => {
    const { repository, rules, service } = createFixture();
    rules.shouldFail = true;

    await expect(service.add('youtube.com')).rejects.toThrow('Falha ao atualizar regras.');
    expect(repository.blocks).toEqual([]);
  });

  it('permite consumir 5 + 5 + 5 minutos antes do cooldown', async () => {
    const { clock, rules, service } = createFixture();
    await service.add('youtube.com');

    await service.grantTemporaryAccess('youtube.com', 5);
    expect(rules.blocks).toEqual([]);
    clock.advance(5 * MINUTE_MS);
    await expect(service.getStatus('youtube.com')).resolves.toMatchObject({
      status: 'available',
      usedMinutes: 5,
      remainingMinutes: 10,
      enabledDurations: [1, 5],
    });

    await service.grantTemporaryAccess('youtube.com', 5);
    clock.advance(5 * MINUTE_MS);
    await expect(service.getStatus('youtube.com')).resolves.toMatchObject({
      status: 'available',
      usedMinutes: 10,
      remainingMinutes: 5,
      enabledDurations: [1, 5],
    });

    const lastGrant = await service.grantTemporaryAccess('youtube.com', 5);
    expect(lastGrant).toMatchObject({
      status: 'active',
      usedMinutes: 15,
      remainingMinutes: 0,
    });

    clock.advance(5 * MINUTE_MS);
    const cooldown = await service.getStatus('youtube.com');
    expect(cooldown).toMatchObject({
      status: 'cooldown',
      usedMinutes: 15,
      remainingMinutes: 0,
    });

    clock.value = cooldown.availableAt ?? 0;
    await expect(service.getStatus('youtube.com')).resolves.toMatchObject({
      status: 'available',
      usedMinutes: 0,
      remainingMinutes: 15,
      enabledDurations: [1, 5, 15],
    });
  });

  it('preserva indefinidamente o saldo parcial enquanto não houver cooldown', async () => {
    const { clock, service } = createFixture();
    await service.add('youtube.com');
    await service.grantTemporaryAccess('youtube.com', 5);

    clock.advance(400 * 24 * 60 * MINUTE_MS);

    await expect(service.getStatus('youtube.com')).resolves.toMatchObject({
      status: 'available',
      usedMinutes: 5,
      remainingMinutes: 10,
    });
  });

  it('habilita somente um minuto quando restam dois', async () => {
    const { clock, service } = createFixture();
    await service.add('youtube.com');

    for (const minutes of [5, 5, 1, 1, 1] as const) {
      await service.grantTemporaryAccess('youtube.com', minutes);
      clock.advance(minutes * MINUTE_MS);
    }

    await expect(service.getStatus('youtube.com')).resolves.toMatchObject({
      remainingMinutes: 2,
      enabledDurations: [1],
    });
    await expect(service.grantTemporaryAccess('youtube.com', 5)).rejects.toBeInstanceOf(
      TemporaryAccessBudgetError,
    );
  });

  it('valida cooldowns personalizados', async () => {
    const { service } = createFixture();

    await expect(service.add('youtube.com', 1)).rejects.toBeInstanceOf(InvalidCooldownError);
  });
});
