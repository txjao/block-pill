import { parseHostname } from "../site/hostname";
import type { StandardBlock } from "./standard-block";
import type { StandardBlockRuleManager } from "./standard-block-rule-manager";
import type { StandardBlockStore } from "./standard-block-store";

export const STANDARD_BLOCK_RULE_ID_START = 1;
export const STANDARD_BLOCK_RULE_ID_END = 999_999;

export class DomainAlreadyBlockedError extends Error {
  constructor() {
    super("Este domínio já está na lista de bloqueios padrão.");
    this.name = "DomainAlreadyBlockedError";
  }
}

export class StandardBlockNotFoundError extends Error {
  constructor() {
    super("O domínio não foi encontrado na lista de bloqueios padrão.");
    this.name = "StandardBlockNotFoundError";
  }
}

export class StandardBlockLimitError extends Error {
  constructor() {
    super("O limite de domínios bloqueados foi atingido.");
    this.name = "StandardBlockLimitError";
  }
}

export class StandardBlockingService {
  private mutation: Promise<void> = Promise.resolve();

  constructor(
    private readonly store: StandardBlockStore,
    private readonly ruleManager: StandardBlockRuleManager
  ) {}

  async list(): Promise<StandardBlock[]> {
    await this.mutation;
    return this.store.getAll();
  }

  add(input: string): Promise<StandardBlock> {
    return this.enqueue(async () => {
      const hostname = parseHostname(input);
      const current = await this.store.getAll();

      if (current.some((block) => block.hostname === hostname)) {
        throw new DomainAlreadyBlockedError();
      }

      const block: StandardBlock = {
        hostname,
        ruleId: findAvailableRuleId(current)
      };
      const updated = [...current, block].sort((left, right) =>
        left.hostname.localeCompare(right.hostname)
      );

      await this.persistAndReplaceRules(current, updated);
      return block;
    });
  }

  remove(input: string): Promise<void> {
    return this.enqueue(async () => {
      const hostname = parseHostname(input);
      const current = await this.store.getAll();
      const updated = current.filter((block) => block.hostname !== hostname);

      if (updated.length === current.length) {
        throw new StandardBlockNotFoundError();
      }

      await this.persistAndReplaceRules(current, updated);
    });
  }

  synchronize(): Promise<void> {
    return this.enqueue(async () => {
      await this.ruleManager.replaceAll(await this.store.getAll());
    });
  }

  private enqueue<T>(operation: () => Promise<T>): Promise<T> {
    const result = this.mutation.then(operation);
    this.mutation = result.then(
      () => undefined,
      () => undefined
    );
    return result;
  }

  private async persistAndReplaceRules(
    previous: StandardBlock[],
    updated: StandardBlock[]
  ): Promise<void> {
    await this.store.setAll(updated);

    try {
      await this.ruleManager.replaceAll(updated);
    } catch (error) {
      await this.store.setAll(previous);
      throw error;
    }
  }
}

function findAvailableRuleId(blocks: StandardBlock[]): number {
  const usedIds = new Set(blocks.map((block) => block.ruleId));

  for (
    let ruleId = STANDARD_BLOCK_RULE_ID_START;
    ruleId <= STANDARD_BLOCK_RULE_ID_END;
    ruleId += 1
  ) {
    if (!usedIds.has(ruleId)) {
      return ruleId;
    }
  }

  throw new StandardBlockLimitError();
}
