import { parseHostname } from '@/shared/web-address/domain';
import type { Clock } from '@/shared/current-time/domain';
import {
  DEFAULT_COOLDOWN_MS,
  MAXIMUM_COOLDOWN_MS,
  MINIMUM_COOLDOWN_MS,
  MINUTE_MS,
  STANDARD_BLOCK_RULE_ID_END,
  STANDARD_BLOCK_RULE_ID_START,
  TEMPORARY_ACCESS_BUDGET_MINUTES,
  TEMPORARY_ACCESS_MINUTES,
} from './standard-block.constants';
import type { StandardBlockRepository } from './standard-block.repository';
import type { StandardBlockRuleManager } from './standard-block.rule-manager';
import type {
  StandardBlock,
  StandardBlockSnapshot,
  TemporaryAccessMinutes,
  TemporaryAccessState,
} from './standard-block.types';

export class StandardBlockAlreadyExistsError extends Error {
  constructor() {
    super('Este domínio já está na lista de bloqueios padrão.');
    this.name = 'StandardBlockAlreadyExistsError';
  }
}

export class StandardBlockNotFoundError extends Error {
  constructor() {
    super('O domínio não foi encontrado na lista de bloqueios padrão.');
    this.name = 'StandardBlockNotFoundError';
  }
}

export class StandardBlockLimitError extends Error {
  constructor() {
    super('O limite de domínios bloqueados foi atingido.');
    this.name = 'StandardBlockLimitError';
  }
}

export class InvalidCooldownError extends Error {
  constructor() {
    super('O cooldown deve estar entre uma hora e dois anos.');
    this.name = 'InvalidCooldownError';
  }
}

export class TemporaryAccessAlreadyActiveError extends Error {
  constructor() {
    super('Já existe um acesso temporário ativo para este domínio.');
    this.name = 'TemporaryAccessAlreadyActiveError';
  }
}

export class TemporaryAccessCooldownError extends Error {
  constructor(readonly availableAt: number) {
    super('Este domínio está em cooldown.');
    this.name = 'TemporaryAccessCooldownError';
  }
}

export class TemporaryAccessBudgetError extends Error {
  constructor() {
    super('A duração solicitada é maior que o saldo disponível.');
    this.name = 'TemporaryAccessBudgetError';
  }
}

export class InvalidTemporaryAccessDurationError extends Error {
  constructor() {
    super('Escolha um acesso temporário de 1, 5 ou 15 minutos.');
    this.name = 'InvalidTemporaryAccessDurationError';
  }
}

export interface GrantTemporaryAccessResult {
  state: TemporaryAccessState;
  activeUntil: number;
}

export class StandardBlockService {
  private mutation: Promise<void> = Promise.resolve();

  constructor(
    private readonly repository: StandardBlockRepository,
    private readonly ruleManager: StandardBlockRuleManager,
    private readonly clock: Clock,
  ) {}

  async list(): Promise<StandardBlock[]> {
    await this.mutation;
    const now = this.clock.now();
    return (await this.repository.getAll()).map((block) =>
      normalizeBlockState(block, now),
    );
  }

  add(input: string, cooldownMilliseconds?: number): Promise<StandardBlock> {
    return this.enqueue(async () => {
      const hostname = parseHostname(input);
      const current = await this.repository.getAll();

      if (current.some((block) => block.hostname === hostname)) {
        throw new StandardBlockAlreadyExistsError();
      }

      if (cooldownMilliseconds !== undefined) {
        validateCooldownMilliseconds(cooldownMilliseconds);
      }

      const block: StandardBlock = {
        hostname,
        ruleId: findAvailableRuleId(current),
        createdAt: this.clock.now(),
        allowedSubdomains: [],
        cooldownMilliseconds,
        temporaryAccess: { usedMinutes: 0 },
      };
      const updated = [...current, block].sort((left, right) =>
        left.hostname.localeCompare(right.hostname),
      );

      await this.persistAndReplaceRules(current, updated, this.clock.now());
      return block;
    });
  }

  remove(input: string): Promise<void> {
    return this.enqueue(async () => {
      const hostname = parseHostname(input);
      const current = await this.repository.getAll();
      const updated = current.filter((block) => block.hostname !== hostname);

      if (updated.length === current.length) {
        throw new StandardBlockNotFoundError();
      }

      await this.persistAndReplaceRules(current, updated, this.clock.now());
    });
  }

  setDomainCooldown(
    input: string,
    cooldownMilliseconds?: number,
  ): Promise<StandardBlock> {
    return this.enqueue(async () => {
      const hostname = parseHostname(input);
      const current = await this.repository.getAll();
      const index = current.findIndex((block) => block.hostname === hostname);
      if (index < 0 || !current[index]) throw new StandardBlockNotFoundError();
      if (cooldownMilliseconds !== undefined)
        validateCooldownMilliseconds(cooldownMilliseconds);
      const updatedBlock = { ...current[index], cooldownMilliseconds };
      const updated = [...current];
      updated[index] = updatedBlock;
      await this.persistAndReplaceRules(current, updated, this.clock.now());
      return updatedBlock;
    });
  }

  addAllowedSubdomain(
    input: string,
    subdomainInput: string,
  ): Promise<StandardBlock> {
    return this.enqueue(async () => {
      const hostname = parseHostname(input);
      const subdomain = parseHostname(subdomainInput);
      if (subdomain === hostname || !subdomain.endsWith(`.${hostname}`)) {
        throw new Error(
          'A exceção precisa ser um subdomínio do domínio bloqueado.',
        );
      }
      const current = await this.repository.getAll();
      const index = current.findIndex((block) => block.hostname === hostname);
      if (index < 0 || !current[index]) throw new StandardBlockNotFoundError();
      const updatedBlock = {
        ...current[index],
        allowedSubdomains: [
          ...new Set([...current[index].allowedSubdomains, subdomain]),
        ],
      };
      const updated = [...current];
      updated[index] = updatedBlock;
      await this.persistAndReplaceRules(current, updated, this.clock.now());
      return updatedBlock;
    });
  }

  getStatus(input: string): Promise<StandardBlockSnapshot> {
    return this.enqueue(async () => {
      const hostname = parseHostname(input);
      const block = (await this.repository.getAll()).find(
        (candidate) => candidate.hostname === hostname,
      );

      if (!block) {
        throw new StandardBlockNotFoundError();
      }

      return createStandardBlockSnapshot(block, this.clock.now());
    });
  }

  grantTemporaryAccess(
    input: string,
    requestedMinutes: TemporaryAccessMinutes,
    globalCooldownMilliseconds = DEFAULT_COOLDOWN_MS,
  ): Promise<StandardBlockSnapshot> {
    return this.enqueue(async () => {
      const hostname = parseHostname(input);
      const current = await this.repository.getAll();
      const blockIndex = current.findIndex(
        (candidate) => candidate.hostname === hostname,
      );

      if (blockIndex < 0) {
        throw new StandardBlockNotFoundError();
      }

      const block = current[blockIndex];
      if (!block) {
        throw new StandardBlockNotFoundError();
      }

      const now = this.clock.now();
      const cooldownMilliseconds = resolveCooldownMilliseconds(
        globalCooldownMilliseconds,
        block.cooldownMilliseconds,
      );
      const grant = grantTemporaryAccess(
        block.temporaryAccess,
        requestedMinutes,
        cooldownMilliseconds,
        now,
      );
      const updatedBlock: StandardBlock = {
        ...block,
        temporaryAccess: grant.state,
      };
      const updated = [...current];
      updated[blockIndex] = updatedBlock;

      await this.persistAndReplaceRules(current, updated, now);
      return createStandardBlockSnapshot(updatedBlock, now);
    });
  }

  synchronize(): Promise<void> {
    return this.enqueue(async () => {
      const now = this.clock.now();
      await this.ruleManager.replaceAll(
        getEnforcedStandardBlocks(await this.repository.getAll(), now),
      );
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
    previous: StandardBlock[],
    updated: StandardBlock[],
    now: number,
  ): Promise<void> {
    await this.repository.setAll(updated);

    try {
      await this.ruleManager.replaceAll(
        getEnforcedStandardBlocks(updated, now),
      );
    } catch (error) {
      await this.repository.setAll(previous);
      throw error;
    }
  }
}

export function validateCooldownMilliseconds(value: number): number {
  if (
    !Number.isFinite(value) ||
    value < MINIMUM_COOLDOWN_MS ||
    value > MAXIMUM_COOLDOWN_MS
  ) {
    throw new InvalidCooldownError();
  }

  return value;
}

export function resolveCooldownMilliseconds(
  globalCooldownMilliseconds: number,
  domainCooldownMilliseconds?: number,
): number {
  return validateCooldownMilliseconds(
    domainCooldownMilliseconds ?? globalCooldownMilliseconds,
  );
}

export function grantTemporaryAccess(
  state: TemporaryAccessState,
  requestedMinutes: TemporaryAccessMinutes,
  cooldownMilliseconds: number,
  now: number,
): GrantTemporaryAccessResult {
  if (!TEMPORARY_ACCESS_MINUTES.includes(requestedMinutes)) {
    throw new InvalidTemporaryAccessDurationError();
  }

  validateTimestamp(now);
  validateCooldownMilliseconds(cooldownMilliseconds);

  const normalized = normalizeTemporaryAccessState(state, now);

  if (normalized.activeUntil !== undefined) {
    throw new TemporaryAccessAlreadyActiveError();
  }

  if (
    normalized.cooldownUntil !== undefined &&
    normalized.cooldownUntil > now
  ) {
    throw new TemporaryAccessCooldownError(normalized.cooldownUntil);
  }

  const remainingMinutes =
    TEMPORARY_ACCESS_BUDGET_MINUTES - normalized.usedMinutes;

  if (requestedMinutes > remainingMinutes) {
    throw new TemporaryAccessBudgetError();
  }

  const usedMinutes = normalized.usedMinutes + requestedMinutes;
  const activeUntil = now + requestedMinutes * MINUTE_MS;
  const nextState: TemporaryAccessState = {
    usedMinutes,
    activeUntil,
  };

  if (usedMinutes === TEMPORARY_ACCESS_BUDGET_MINUTES) {
    nextState.cooldownUntil = activeUntil + cooldownMilliseconds;
  }

  return { state: nextState, activeUntil };
}

export function createStandardBlockSnapshot(
  block: StandardBlock,
  now: number,
): StandardBlockSnapshot {
  const state = normalizeTemporaryAccessState(block.temporaryAccess, now);
  const remainingMinutes = TEMPORARY_ACCESS_BUDGET_MINUTES - state.usedMinutes;

  if (state.activeUntil !== undefined) {
    return {
      hostname: block.hostname,
      status: 'active',
      usedMinutes: state.usedMinutes,
      remainingMinutes,
      enabledDurations: [],
      activeUntil: state.activeUntil,
    };
  }

  if (state.cooldownUntil !== undefined) {
    return {
      hostname: block.hostname,
      status: 'cooldown',
      usedMinutes: state.usedMinutes,
      remainingMinutes: 0,
      enabledDurations: [],
      availableAt: state.cooldownUntil,
    };
  }

  return {
    hostname: block.hostname,
    status: 'available',
    usedMinutes: state.usedMinutes,
    remainingMinutes,
    enabledDurations: TEMPORARY_ACCESS_MINUTES.filter(
      (minutes) => minutes <= remainingMinutes,
    ),
  };
}

export function normalizeTemporaryAccessState(
  state: TemporaryAccessState,
  now: number,
): TemporaryAccessState {
  validateTimestamp(now);

  if (state.cooldownUntil !== undefined && state.cooldownUntil <= now) {
    return { usedMinutes: 0 };
  }

  if (state.activeUntil !== undefined && state.activeUntil <= now) {
    const { activeUntil: _activeUntil, ...withoutActiveAccess } = state;
    return withoutActiveAccess;
  }

  return { ...state };
}

export function getEnforcedStandardBlocks(
  blocks: StandardBlock[],
  now: number,
): StandardBlock[] {
  return blocks.filter((block) => {
    const state = normalizeTemporaryAccessState(block.temporaryAccess, now);
    return state.activeUntil === undefined;
  });
}

function normalizeBlockState(block: StandardBlock, now: number): StandardBlock {
  return {
    ...block,
    temporaryAccess: normalizeTemporaryAccessState(block.temporaryAccess, now),
  };
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

function validateTimestamp(value: number): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError('O horário informado é inválido.');
  }
}
