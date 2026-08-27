import { parseHostname } from '../../../shared/site/hostname';
import type { Clock } from '../../../shared/time/clock';
import {
  PERMANENT_BLOCK_RULE_ID_END,
  PERMANENT_BLOCK_RULE_ID_START,
} from './permanent-block.constants';
import type { PermanentBlockRepository } from './permanent-block.repository';
import type { PermanentBlockRuleManager } from './permanent-block.rule-manager';
import type { PermanentBlock } from './permanent-block.types';

export class PermanentBlockAlreadyExistsError extends Error {
  constructor() {
    super('Este domínio já está bloqueado permanentemente.');
    this.name = 'PermanentBlockAlreadyExistsError';
  }
}

export class PermanentBlockLimitError extends Error {
  constructor() {
    super('O limite de bloqueios permanentes foi atingido.');
    this.name = 'PermanentBlockLimitError';
  }
}

export class PermanentBlockService {
  private mutation: Promise<void> = Promise.resolve();

  constructor(
    private readonly repository: PermanentBlockRepository,
    private readonly ruleManager: PermanentBlockRuleManager,
    private readonly clock: Clock,
  ) {}

  async list(): Promise<PermanentBlock[]> {
    await this.mutation;
    return this.repository.getAll();
  }

  add(input: string): Promise<PermanentBlock> {
    return this.enqueue(async () => {
      const hostname = parseHostname(input);
      const current = await this.repository.getAll();

      if (current.some((block) => block.hostname === hostname)) {
        throw new PermanentBlockAlreadyExistsError();
      }

      const block: PermanentBlock = {
        hostname,
        ruleId: findAvailableRuleId(current),
        createdAt: this.clock.now(),
      };
      const updated = [...current, block].sort((left, right) =>
        left.hostname.localeCompare(right.hostname),
      );

      await this.persistAndReplaceRules(current, updated);
      return block;
    });
  }

  synchronize(): Promise<void> {
    return this.enqueue(async () => {
      await this.ruleManager.replaceAll(await this.repository.getAll());
    });
  }

  private enqueue<T>(operation: () => Promise<T>): Promise<T> {
    const result = this.mutation.then(operation);
    this.mutation = result.then(
      () => undefined,
      () => undefined,
    );
    return result;
  }

  private async persistAndReplaceRules(
    previous: PermanentBlock[],
    updated: PermanentBlock[],
  ): Promise<void> {
    await this.repository.setAll(updated);

    try {
      await this.ruleManager.replaceAll(updated);
    } catch (error) {
      await this.repository.setAll(previous);
      throw error;
    }
  }
}

function findAvailableRuleId(blocks: PermanentBlock[]): number {
  const usedIds = new Set(blocks.map((block) => block.ruleId));

  for (
    let ruleId = PERMANENT_BLOCK_RULE_ID_START;
    ruleId <= PERMANENT_BLOCK_RULE_ID_END;
    ruleId += 1
  ) {
    if (!usedIds.has(ruleId)) {
      return ruleId;
    }
  }

  throw new PermanentBlockLimitError();
}
