import { parseHostname } from '@/shared/web-address/domain';
import type { Clock } from '@/shared/current-time/domain';
import { MAXIMUM_ANTI_DURATION_MS, MINIMUM_ANTI_DURATION_MS } from './anti-mode.constants';
import type { AntiModeRepository } from './anti-mode.repository';
import type { AntiModeRuleManager } from './anti-mode.rule-manager';
import type {
  ActivateAntiModeInput,
  AntiAccessMinutes,
  AntiDurationUnit,
  AntiModeConfig,
  AntiModeId,
} from './anti-mode.types';
import { ANTI_PORN_DOMAINS, ANTI_PORN_WARNING_DOMAINS } from '@/features/anti-porn';
import { ANTI_BET_DOMAINS, ANTI_BET_WARNING_DOMAINS } from '@/features/anti-bet';

const DEFAULT_ANTI_DOMAINS = {
  'anti-porn': ANTI_PORN_DOMAINS,
  'anti-bet': ANTI_BET_DOMAINS,
} as const;

const DEFAULT_WARNING_DOMAINS = {
  'anti-porn': ANTI_PORN_WARNING_DOMAINS,
  'anti-bet': ANTI_BET_WARNING_DOMAINS,
} as const;

export class AntiModeCommitmentError extends Error {
  constructor() {
    super('Este compromisso ainda está ativo e não pode ser desativado.');
    this.name = 'AntiModeCommitmentError';
  }
}

export class AntiModeDurationError extends Error {
  constructor() {
    super('O compromisso deve durar entre um dia e 732 dias.');
    this.name = 'AntiModeDurationError';
  }
}

export class AntiModeService {
  constructor(
    private readonly repository: AntiModeRepository,
    private readonly ruleManager: AntiModeRuleManager,
    private readonly clock: Clock,
  ) {}

  async list(): Promise<AntiModeConfig[]> {
    return ensureModes(await this.repository.getAll());
  }

  async activate(input: ActivateAntiModeInput): Promise<AntiModeConfig[]> {
    const configs = await this.list();
    const index = configs.findIndex((config) => config.id === input.mode);
    const current = configs[index] as AntiModeConfig;
    if (
      current.enabled &&
      (current.permanent || (current.commitmentEndsAt ?? Infinity) > this.clock.now())
    ) {
      throw new AntiModeCommitmentError();
    }
    const imported = input.importFrom
      ? configs.find((config) => config.id === input.importFrom)
      : undefined;
    const now = this.clock.now();
    const duration = input.permanent
      ? undefined
      : convertAntiDuration(input.durationValue ?? 31, input.durationUnit ?? 'days');

    configs[index] = {
      ...current,
      enabled: true,
      permanent: input.permanent,
      createdAt: now,
      commitmentEndsAt: duration === undefined ? undefined : now + duration,
      goals: imported?.goals.length ? imported.goals : cleanList(input.goals),
      hobbies: imported?.hobbies.length ? imported.hobbies : cleanList(input.hobbies),
      philosophicalKnowledge: imported?.philosophicalKnowledge ?? input.philosophicalKnowledge,
    };
    await this.persist(configs);
    return configs;
  }

  async deactivate(mode: AntiModeId): Promise<AntiModeConfig[]> {
    const configs = await this.list();
    const index = configs.findIndex((config) => config.id === mode);
    const config = configs[index] as AntiModeConfig;
    if (config.permanent || (config.commitmentEndsAt ?? Infinity) > this.clock.now()) {
      throw new AntiModeCommitmentError();
    }
    configs[index] = { ...config, enabled: false };
    await this.persist(configs);
    return configs;
  }

  async addDomain(mode: AntiModeId, input: string): Promise<AntiModeConfig[]> {
    const hostname = parseHostname(input);
    const configs = await this.list();
    const index = configs.findIndex((config) => config.id === mode);
    const config = configs[index] as AntiModeConfig;
    configs[index] = {
      ...config,
      domains: [...new Set([...config.domains, hostname])],
    };
    await this.persist(configs);
    return configs;
  }

  async grantAccess(
    mode: AntiModeId,
    input: string,
    minutes: AntiAccessMinutes,
  ): Promise<{ configs: AntiModeConfig[]; activeUntil: number }> {
    const hostname = parseHostname(input);
    const configs = await this.list();
    const index = configs.findIndex((config) => config.id === mode);
    const config = configs[index] as AntiModeConfig;
    if (!config.enabled) {
      throw new Error('Este modo anti não está ativo.');
    }
    if (!config.warningDomains.includes(hostname)) {
      throw new Error('Este domínio não permite liberação no modo anti.');
    }
    const activeUntil = this.clock.now() + minutes * 60_000;
    for (let configIndex = 0; configIndex < configs.length; configIndex += 1) {
      const candidate = configs[configIndex];
      if (!candidate?.enabled || !candidate.warningDomains.includes(hostname)) continue;
      configs[configIndex] = {
        ...candidate,
        accessUntilByHostname: {
          ...candidate.accessUntilByHostname,
          [hostname]: activeUntil,
        },
      };
    }
    await this.persist(configs);
    return { configs, activeUntil };
  }

  synchronize(): Promise<void> {
    return this.list().then((configs) => this.ruleManager.replaceAll(configs, this.clock.now()));
  }

  private async persist(configs: AntiModeConfig[]): Promise<void> {
    const previous = await this.repository.getAll();
    await this.repository.setAll(configs);
    try {
      await this.ruleManager.replaceAll(configs, this.clock.now());
    } catch (error) {
      await this.repository.setAll(previous);
      throw error;
    }
  }
}

export function convertAntiDuration(value: number, unit: AntiDurationUnit): number {
  if (!Number.isFinite(value) || value <= 0) throw new AntiModeDurationError();
  const days = unit === 'days' ? value : unit === 'months' ? value * 31 : value * 366;
  const milliseconds = days * 24 * 60 * 60 * 1000;
  if (milliseconds < MINIMUM_ANTI_DURATION_MS || milliseconds > MAXIMUM_ANTI_DURATION_MS) {
    throw new AntiModeDurationError();
  }
  return milliseconds;
}

function ensureModes(configs: AntiModeConfig[]): AntiModeConfig[] {
  return (['anti-porn', 'anti-bet'] as const).map(
    (id) =>
      configs.find((config) => config.id === id) ?? {
        id,
        enabled: false,
        permanent: false,
        goals: [],
        hobbies: [],
        philosophicalKnowledge: false,
        domains: [...DEFAULT_ANTI_DOMAINS[id]],
        warningDomains: [...DEFAULT_WARNING_DOMAINS[id]],
        accessUntilByHostname: {},
      },
  );
}

function cleanList(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))].slice(0, 40);
}
