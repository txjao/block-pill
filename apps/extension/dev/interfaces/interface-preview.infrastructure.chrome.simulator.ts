import { REFLECTIONS_STORAGE_KEY } from '@/features/reflections/domain/reflections.constants';
import {
  ANTI_MODE_MESSAGE_TYPE,
  ANTI_MODE_MESSAGE_PREFIX,
  INCOGNITO_MESSAGE_TYPE,
  INCOGNITO_MESSAGE_PREFIX,
} from '@/features/anti-mode/application/anti-mode.messages.constants';
import type {
  AntiModeConfig,
  AntiModeId,
} from '@/features/anti-mode/domain/anti-mode.types';
import {
  PERMANENT_BLOCK_MESSAGE_PREFIX,
  PERMANENT_BLOCK_MESSAGE_TYPE,
} from '@/features/permanent-block/application/permanent-block.messages.constants';
import type { PermanentBlock } from '@/features/permanent-block/domain/permanent-block.types';
import {
  STANDARD_BLOCK_MESSAGE_PREFIX,
  STANDARD_BLOCK_MESSAGE_TYPE,
} from '@/features/standard-block/application/standard-block.messages.constants';
import type {
  StandardBlock,
  StandardBlockSnapshot,
} from '@/features/standard-block/domain/standard-block.types';
import { INTERFACE_PREVIEW_NAME } from './interface-preview.constants';

const currentTime = Date.now();
let nextRuleId = 3;
let standardBlocks: StandardBlock[] = [
  {
    hostname: 'video.example' as StandardBlock['hostname'],
    ruleId: 1,
    createdAt: currentTime - 12 * 86_400_000,
    allowedSubdomains: [],
    temporaryAccess: { usedMinutes: 0 },
  },
  {
    hostname: 'social.example' as StandardBlock['hostname'],
    ruleId: 2,
    createdAt: currentTime - 5 * 86_400_000,
    allowedSubdomains: ['work.social.example'] as StandardBlock['hostname'][],
    cooldownMilliseconds: 7_200_000,
    temporaryAccess: { usedMinutes: 5 },
  },
];
let permanentBlocks: PermanentBlock[] = [
  {
    hostname: 'casino.example' as PermanentBlock['hostname'],
    ruleId: 1_000_001,
    createdAt: currentTime - 30 * 86_400_000,
  },
];
let antiModeConfigs: AntiModeConfig[] = [
  createAntiModeConfig('anti-porn', ['Proteger meu foco'], ['ler', 'caminhar']),
  createAntiModeConfig(
    'anti-bet',
    ['Cuidar das minhas finanças'],
    ['cozinhar'],
  ),
];
let globalCooldownMilliseconds = 3_600_000;

export function installChromeSimulator(): void {
  const parameters = new URLSearchParams(globalThis.location.search);
  const previewHostname = parameters.get('hostname');
  if (
    parameters.get('mode') === 'standard' &&
    previewHostname &&
    !standardBlocks.some((block) => block.hostname === previewHostname)
  ) {
    standardBlocks.push({
      hostname: previewHostname as StandardBlock['hostname'],
      ruleId: nextRuleId++,
      createdAt: currentTime,
      allowedSubdomains: [],
      temporaryAccess: { usedMinutes: 0 },
    });
  }
  const preferences: Record<string, unknown> = {
    [REFLECTIONS_STORAGE_KEY]: true,
  };
  Object.defineProperty(globalThis, 'chrome', {
    configurable: true,
    value: {
      storage: {
        local: {
          get: () => Promise.resolve({ ...preferences }),
          set: (values: Record<string, unknown>) => {
            Object.assign(preferences, values);
            return Promise.resolve();
          },
        },
      },
      runtime: {
        getURL: (path: string) => `/${path}`,
        sendMessage: handleMessage,
      },
      tabs: {
        create: ({ url }: { url?: string }) => {
          if (url) openSimulatedTab(url);
          return Promise.resolve(undefined);
        },
        query: () => Promise.resolve([{ url: 'https://video.example/watch' }]),
      },
    },
  });
}

function openSimulatedTab(value: string): void {
  const url = new URL(value, globalThis.location.origin);
  if (url.pathname.endsWith('/src/entrypoints/settings/index.html')) {
    url.pathname = '/dev/interfaces/frame/index.html';
    url.searchParams.set('interface', INTERFACE_PREVIEW_NAME.settings);
  }
  globalThis.open(url, '_blank', 'noopener');
}

function handleMessage(message: unknown): Promise<unknown> {
  return Promise.resolve(dispatchMessage(message));
}

function dispatchMessage(message: unknown): unknown {
  if (!isMessage(message)) {
    return createErrorResponse('A mensagem enviada pelo preview é inválida.');
  }

  if (message.type.startsWith(STANDARD_BLOCK_MESSAGE_PREFIX)) {
    return handleStandardBlockMessage(message);
  }
  if (message.type.startsWith(PERMANENT_BLOCK_MESSAGE_PREFIX)) {
    return handlePermanentBlockMessage(message);
  }
  if (
    message.type.startsWith(ANTI_MODE_MESSAGE_PREFIX) ||
    message.type.startsWith(INCOGNITO_MESSAGE_PREFIX)
  ) {
    return handleAntiModeMessage(message);
  }
  return createErrorResponse('Esta mensagem não é suportada pelo simulador.');
}

function handleStandardBlockMessage(message: PreviewMessage): unknown {
  const hostname = readString(message.hostname);

  switch (message.type) {
    case STANDARD_BLOCK_MESSAGE_TYPE.settings:
      return {
        ok: true,
        settings: { globalCooldownMilliseconds },
        blocks: standardBlocks,
      };
    case STANDARD_BLOCK_MESSAGE_TYPE.list:
      return { ok: true, blocks: standardBlocks };
    case STANDARD_BLOCK_MESSAGE_TYPE.add:
      if (!hostname) return createErrorResponse('Informe um domínio.');
      standardBlocks = [
        ...standardBlocks,
        {
          hostname: hostname as StandardBlock['hostname'],
          ruleId: nextRuleId++,
          createdAt: Date.now(),
          allowedSubdomains: [],
          temporaryAccess: { usedMinutes: 0 },
        },
      ];
      return { ok: true, blocks: standardBlocks };
    case STANDARD_BLOCK_MESSAGE_TYPE.remove:
      standardBlocks = standardBlocks.filter(
        (block) => block.hostname !== hostname,
      );
      return { ok: true, blocks: standardBlocks };
    case STANDARD_BLOCK_MESSAGE_TYPE.updateSettings:
      globalCooldownMilliseconds =
        readNumber(message.globalCooldownMilliseconds) ??
        globalCooldownMilliseconds;
      return {
        ok: true,
        settings: { globalCooldownMilliseconds },
        blocks: standardBlocks,
      };
    case STANDARD_BLOCK_MESSAGE_TYPE.updateDomainCooldown:
      standardBlocks = standardBlocks.map((block) =>
        block.hostname === hostname
          ? {
              ...block,
              cooldownMilliseconds:
                readNumber(message.cooldownMilliseconds) ?? undefined,
            }
          : block,
      );
      return { ok: true, blocks: standardBlocks };
    case STANDARD_BLOCK_MESSAGE_TYPE.addSubdomainException: {
      const subdomain = readString(message.subdomain);
      standardBlocks = standardBlocks.map((block) =>
        block.hostname === hostname && subdomain
          ? {
              ...block,
              allowedSubdomains: [
                ...block.allowedSubdomains,
                subdomain as StandardBlock['hostname'],
              ],
            }
          : block,
      );
      return { ok: true, blocks: standardBlocks };
    }
    case STANDARD_BLOCK_MESSAGE_TYPE.status:
      return { ok: true, snapshot: createStandardBlockSnapshot(hostname) };
    case STANDARD_BLOCK_MESSAGE_TYPE.context:
      return {
        ok: true,
        context: createStandardBlockContext(),
      };
    case STANDARD_BLOCK_MESSAGE_TYPE.requestAccess:
      return {
        ok: true,
        snapshot: createStandardBlockSnapshot(hostname, 'active'),
      };
    default:
      return createErrorResponse(
        'Esta operação de bloqueio padrão não está simulada.',
      );
  }
}

function handlePermanentBlockMessage(message: PreviewMessage): unknown {
  if (message.type === PERMANENT_BLOCK_MESSAGE_TYPE.add) {
    const hostname = readString(message.hostname);
    if (!hostname) return createErrorResponse('Informe um domínio.');
    permanentBlocks = [
      ...permanentBlocks,
      {
        hostname: hostname as PermanentBlock['hostname'],
        ruleId: 1_000_000 + nextRuleId++,
        createdAt: Date.now(),
      },
    ];
  }

  if (
    message.type === PERMANENT_BLOCK_MESSAGE_TYPE.list ||
    message.type === PERMANENT_BLOCK_MESSAGE_TYPE.add
  ) {
    return { ok: true, blocks: permanentBlocks };
  }

  return createErrorResponse(
    'Esta operação de bloqueio permanente não está simulada.',
  );
}

function handleAntiModeMessage(message: PreviewMessage): unknown {
  if (message.type === INCOGNITO_MESSAGE_TYPE.status) {
    return {
      ok: true,
      incognitoAllowed: true,
      blocked: false,
      controlEnabled: true,
      lockedByAntiMode: true,
    };
  }
  if (
    message.type === INCOGNITO_MESSAGE_TYPE.openSettings ||
    message.type === INCOGNITO_MESSAGE_TYPE.setControl ||
    message.type === INCOGNITO_MESSAGE_TYPE.suspend
  ) {
    return {
      ok: true,
      incognitoAllowed: true,
      blocked: false,
      controlEnabled: true,
      lockedByAntiMode: true,
    };
  }

  const mode = readAntiModeId(message.mode);
  if (message.type === ANTI_MODE_MESSAGE_TYPE.activate && mode) {
    antiModeConfigs = antiModeConfigs.map((config) =>
      config.id === mode
        ? {
            ...config,
            enabled: true,
            commitmentEndsAt:
              Date.now() +
              (readNumber(message.durationValue) ?? 31) *
                (message.durationUnit === 'years'
                  ? 365
                  : message.durationUnit === 'months'
                    ? 30
                    : 1) *
                86_400_000,
            permanent: message.permanent === true,
            goals: readStringArray(message.goals),
            hobbies: readStringArray(message.hobbies),
            philosophicalKnowledge: message.philosophicalKnowledge === true,
          }
        : config,
    );
  } else if (message.type === ANTI_MODE_MESSAGE_TYPE.deactivate && mode) {
    const config = antiModeConfigs.find((item) => item.id === mode);
    if (
      config?.permanent ||
      (config?.commitmentEndsAt ?? Infinity) > Date.now()
    ) {
      return createErrorResponse(
        'Aguarde o fim do compromisso para desativar este modo.',
      );
    }
    antiModeConfigs = antiModeConfigs.map((config) =>
      config.id === mode ? { ...config, enabled: false } : config,
    );
  } else if (message.type === ANTI_MODE_MESSAGE_TYPE.addDomain && mode) {
    const hostname = readString(message.hostname);
    antiModeConfigs = antiModeConfigs.map((config) =>
      config.id === mode && hostname
        ? { ...config, domains: [...config.domains, hostname] }
        : config,
    );
  } else if (message.type === ANTI_MODE_MESSAGE_TYPE.grantAccess && mode) {
    const hostname = readString(message.hostname);
    const minutes = readNumber(message.minutes) ?? 1;
    antiModeConfigs = antiModeConfigs.map((config) =>
      config.id === mode && hostname
        ? {
            ...config,
            accessUntilByHostname: {
              ...config.accessUntilByHostname,
              [hostname]: Date.now() + minutes * 60_000,
            },
          }
        : config,
    );
  }

  if (
    message.type === ANTI_MODE_MESSAGE_TYPE.list ||
    message.type === ANTI_MODE_MESSAGE_TYPE.activate ||
    message.type === ANTI_MODE_MESSAGE_TYPE.deactivate ||
    message.type === ANTI_MODE_MESSAGE_TYPE.addDomain ||
    message.type === ANTI_MODE_MESSAGE_TYPE.grantAccess
  ) {
    return { ok: true, configs: antiModeConfigs };
  }

  return createErrorResponse('Esta operação do modo anti não está simulada.');
}

function createStandardBlockSnapshot(
  hostname: string,
  forcedState?: StandardBlockSnapshot['status'],
): StandardBlockSnapshot {
  const requestedState = new URLSearchParams(globalThis.location.search).get(
    'state',
  );
  const status =
    forcedState ??
    (requestedState === 'active' || requestedState === 'cooldown'
      ? requestedState
      : 'available');

  return {
    hostname: hostname as StandardBlockSnapshot['hostname'],
    status,
    usedMinutes: status === 'available' ? 5 : 15,
    remainingMinutes: status === 'available' ? 10 : 0,
    enabledDurations: status === 'available' ? [1, 5] : [],
    activeUntil: status === 'active' ? Date.now() + 300_000 : undefined,
    availableAt: status === 'cooldown' ? Date.now() + 3_600_000 : undefined,
  };
}

function createStandardBlockContext() {
  const parameters = new URLSearchParams(globalThis.location.search);
  const hostname = parameters.get('hostname');
  const attemptedHostname = parameters.get('attemptedHostname');
  return hostname && attemptedHostname
    ? { hostname, attemptedHostname }
    : undefined;
}

function createAntiModeConfig(
  id: AntiModeId,
  goals: string[],
  hobbies: string[],
): AntiModeConfig {
  const commitmentOngoing =
    new URLSearchParams(globalThis.location.search).get('commitment') ===
    'ongoing';
  return {
    id,
    enabled: commitmentOngoing,
    permanent: false,
    createdAt: currentTime - 14 * 86_400_000,
    commitmentEndsAt: commitmentOngoing
      ? currentTime + 31 * 86_400_000
      : undefined,
    goals,
    hobbies,
    philosophicalKnowledge: true,
    domains: [],
    warningDomains: id === 'anti-bet' ? ['sports.example'] : ['social.example'],
    accessUntilByHostname: {},
  };
}

interface PreviewMessage extends Record<string, unknown> {
  type: string;
}

function isMessage(value: unknown): value is PreviewMessage {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    typeof value.type === 'string'
  );
}

function readString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function readNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value)
    ? value
    : undefined;
}

function readStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

function readAntiModeId(value: unknown): AntiModeId | undefined {
  return value === 'anti-porn' || value === 'anti-bet' ? value : undefined;
}

function createErrorResponse(message: string) {
  return { ok: false, message } as const;
}
