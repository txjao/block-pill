import {
  ChromeStandardBlockRepository,
  ChromeStandardBlockRuleManager,
  ChromeStandardBlockSettingsRepository,
  StandardBlockController,
  StandardBlockService,
  createStandardAccessAlarmName,
  handleStandardBlockRequest,
  parseStandardBlockRequest,
  type ParsedStandardBlockRequest,
  type StandardBlockResponse,
} from '../../standard-block';
import {
  ChromePermanentBlockRepository,
  ChromePermanentBlockRuleManager,
  PermanentBlockController,
  PermanentBlockService,
  handlePermanentBlockRequest,
  parsePermanentBlockRequest,
} from '../../permanent-block';
import { systemClock } from '../../../shared/time/clock';
import { parseHostname } from '../../../shared/site/hostname';
import {
  ActivityService,
  ChromeActivityRepository,
  handleActivityRequest,
  parseActivityRequest,
} from '../../activity';
import {
  ANTI_ACCESS_ALARM_PREFIX,
  AntiModeController,
  AntiModeService,
  ChromeAntiModeRepository,
  ChromeAntiModeRuleManager,
  handleAntiModeRequest,
  parseAntiModeRequest,
  type ParsedAntiModeRequest,
  type AntiModeResponse,
} from '../../anti-mode';

const standardBlockSettings = new ChromeStandardBlockSettingsRepository();
const standardBlock = new StandardBlockController(
  new StandardBlockService(
    new ChromeStandardBlockRepository(),
    new ChromeStandardBlockRuleManager(),
    systemClock,
  ),
  standardBlockSettings,
);

const permanentBlock = new PermanentBlockController(
  new PermanentBlockService(
    new ChromePermanentBlockRepository(),
    new ChromePermanentBlockRuleManager(),
    systemClock,
  ),
);

const activity = new ActivityService(new ChromeActivityRepository(), systemClock, () =>
  crypto.randomUUID(),
);

const antiMode = new AntiModeController(
  new AntiModeService(new ChromeAntiModeRepository(), new ChromeAntiModeRuleManager(), systemClock),
);

export function registerChromeBrowserRuntime(): void {
  chrome.runtime.onInstalled.addListener(() => {
    void synchronizeRules();
  });

  chrome.runtime.onStartup.addListener(() => {
    void synchronizeRules();
  });

  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name.startsWith('standard-block-access:')) {
      void expireStandardAccess(alarm.name);
    } else if (alarm.name.startsWith(ANTI_ACCESS_ALARM_PREFIX)) {
      void expireAntiAccess(alarm.name);
    }
  });

  chrome.windows.onCreated.addListener((window) => {
    if (window.incognito) void closeIncognitoWindowWhenProtected(window.id);
  });

  chrome.webNavigation.onBeforeNavigate.addListener((details) => {
    if (details.frameId === 0) void recordNavigationAttempt(details.url, details.tabId);
  });

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const request = parseStandardBlockRequest(message);

    if (request) {
      if (request.type === 'standard-blocking/context') {
        void getStandardBlockContext(sender.tab?.id).then((context) => {
          sendResponse({ ok: true, context } satisfies StandardBlockResponse);
        });
        return true;
      }
      void handleStandardRequest(request).then((response) => {
        if (
          request.type === 'standard-blocking/request-access' &&
          response.ok &&
          'snapshot' in response &&
          response.snapshot.activeUntil !== undefined
        ) {
          void chrome.alarms.create(createStandardAccessAlarmName(response.snapshot.hostname), {
            when: response.snapshot.activeUntil,
          });
          void activity.record({
            source: 'standard',
            kind: 'access-granted',
            hostname: response.snapshot.hostname,
            path: '/',
            durationMinutes: request.minutes,
          });
        } else if (
          request.type === 'standard-blocking/add' &&
          response.ok &&
          'blocks' in response
        ) {
          const hostname = parseHostname(request.hostname);
          void activity.record({
            source: 'standard',
            kind: 'created',
            hostname,
            path: '/',
          });
        }

        sendResponse(response);
      });
      return true;
    }
    if (hasMessageTypePrefix(message, 'standard-blocking/')) {
      sendResponse(invalidMessageResponse());
      return false;
    }

    const permanentRequest = parsePermanentBlockRequest(message);
    if (permanentRequest) {
      void handlePermanentRequest(permanentRequest).then(sendResponse);
      return true;
    }
    if (hasMessageTypePrefix(message, 'permanent-block/')) {
      sendResponse(invalidMessageResponse());
      return false;
    }

    const activityRequest = parseActivityRequest(message);
    if (activityRequest) {
      void handleActivityRequest(activity, activityRequest).then(sendResponse);
      return true;
    }
    if (hasMessageTypePrefix(message, 'activity/')) {
      sendResponse(invalidMessageResponse());
      return false;
    }

    const antiRequest = parseAntiModeRequest(message);
    if (!antiRequest) {
      if (
        hasMessageTypePrefix(message, 'anti-mode/') ||
        hasMessageTypePrefix(message, 'incognito/')
      ) {
        sendResponse(invalidMessageResponse());
      }
      return false;
    }
    void handleAntiRequest(antiRequest).then(sendResponse);
    return true;
  });
}

async function handleStandardRequest(
  request: ParsedStandardBlockRequest,
): Promise<StandardBlockResponse> {
  if (request.type === 'standard-blocking/add') {
    const hostname = parseHostname(request.hostname);
    const permanentExists = (await permanentBlock.list()).some(
      (block) => block.hostname === hostname,
    );
    if (permanentExists) {
      return {
        ok: false,
        message:
          'Este domínio já possui um bloqueio permanente e não pode receber uma regra padrão.',
      };
    }
  }
  return handleStandardBlockRequest(standardBlock, request);
}

function hasMessageTypePrefix(message: unknown, prefix: string): boolean {
  if (typeof message !== 'object' || message === null || !('type' in message)) return false;
  return typeof message.type === 'string' && message.type.startsWith(prefix);
}

function invalidMessageResponse(): { ok: false; message: string } {
  return { ok: false, message: 'A mensagem recebida possui dados inválidos.' };
}

async function synchronizeRules(): Promise<void> {
  try {
    await Promise.all([
      standardBlock.synchronize(),
      permanentBlock.synchronize(),
      antiMode.synchronize(),
    ]);
    await restoreAccessAlarms();
  } catch (error) {
    console.error('Não foi possível sincronizar as regras da extensão.', error);
  }
}

async function restoreAccessAlarms(): Promise<void> {
  const [standardBlocks, antiConfigs] = await Promise.all([standardBlock.list(), antiMode.list()]);

  await Promise.all([
    ...standardBlocks.flatMap((block) =>
      block.temporaryAccess.activeUntil && block.temporaryAccess.activeUntil > Date.now()
        ? [
            chrome.alarms.create(createStandardAccessAlarmName(block.hostname), {
              when: block.temporaryAccess.activeUntil,
            }),
          ]
        : [],
    ),
    ...antiConfigs.flatMap((config) =>
      Object.entries(config.accessUntilByHostname).flatMap(([hostname, activeUntil]) =>
        activeUntil > Date.now()
          ? [
              chrome.alarms.create(`${ANTI_ACCESS_ALARM_PREFIX}${config.id}:${hostname}`, {
                when: activeUntil,
              }),
            ]
          : [],
      ),
    ),
  ]);
}

async function recordNavigationAttempt(value: string, tabId: number): Promise<void> {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return;
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  const hostname = url.hostname.replace(/^www\./, '').replace(/\.$/, '');
  const path = url.pathname || '/';
  const [standardBlocks, permanentBlocks, antiConfigs] = await Promise.all([
    standardBlock.list(),
    permanentBlock.list(),
    antiMode.list(),
  ]);

  const standard = standardBlocks.find((block) => matchesHostname(value, block.hostname));
  const isAllowedSubdomain = standard?.allowedSubdomains.some(
    (allowed) => hostname === allowed || hostname.endsWith(`.${allowed}`),
  );
  if (standard && !isAllowedSubdomain) {
    await chrome.storage.session.set({
      [`standard-block-context:${tabId}`]: {
        hostname: standard.hostname,
        attemptedHostname: hostname,
      },
    });
    const status = await standardBlock.getStatus(standard.hostname);
    if (status.status !== 'active') {
      await activity.record({
        source: 'standard',
        kind: 'attempt',
        hostname: standard.hostname,
        path,
      });
    }
  }

  for (const block of permanentBlocks) {
    if (matchesHostname(value, block.hostname)) {
      await activity.record({
        source: 'permanent',
        kind: 'attempt',
        hostname: block.hostname,
        path,
      });
    }
  }

  for (const config of antiConfigs) {
    if (!config.enabled) continue;
    const matched = [...config.domains, ...config.warningDomains].find((domain) =>
      matchesHostname(value, domain),
    );
    if (matched && (config.accessUntilByHostname[matched] ?? 0) <= Date.now()) {
      await activity.record({ source: config.id, kind: 'attempt', hostname: matched, path });
    }
  }
}

async function getStandardBlockContext(
  tabId?: number,
): Promise<{ hostname: string; attemptedHostname: string } | undefined> {
  if (tabId === undefined) return undefined;
  const key = `standard-block-context:${tabId}`;
  const result = await chrome.storage.session.get(key);
  const value = result[key];
  if (!value || typeof value !== 'object') return undefined;
  const context = value as Record<string, unknown>;
  if (typeof context.hostname !== 'string' || typeof context.attemptedHostname !== 'string')
    return undefined;
  return { hostname: context.hostname, attemptedHostname: context.attemptedHostname };
}
async function handleAntiRequest(request: ParsedAntiModeRequest): Promise<AntiModeResponse> {
  if (request.type === 'incognito/status') return getIncognitoStatus();
  if (request.type === 'incognito/open-settings') {
    await chrome.tabs.create({ url: `chrome://extensions/?id=${chrome.runtime.id}` });
    return getIncognitoStatus();
  }
  if (request.type === 'incognito/suspend') return suspendIncognitoControl(request.minutes);
  if (request.type === 'incognito/set-control') return setIncognitoControl(request.blocked);

  if (request.type === 'anti-mode/activate' && !(await isIncognitoAllowed())) {
    return {
      ok: false,
      permissionRequired: true,
      message: 'O acesso ao modo anônimo é estritamente necessário para ativar um modo anti.',
    };
  }

  const response = await handleAntiModeRequest(antiMode, request);
  if (
    request.type === 'anti-mode/grant-access' &&
    response.ok &&
    'configs' in response &&
    response.activeUntil !== undefined
  ) {
    await chrome.alarms.create(`${ANTI_ACCESS_ALARM_PREFIX}${request.mode}:${request.hostname}`, {
      when: response.activeUntil,
    });
  }
  return response;
}

async function getIncognitoStatus(): Promise<AntiModeResponse> {
  const [incognitoAllowed, settings, configs] = await Promise.all([
    isIncognitoAllowed(),
    getIncognitoSettings(),
    antiMode.list(),
  ]);
  const lockedByAntiMode = configs.some(
    (config) =>
      config.enabled && (config.permanent || (config.commitmentEndsAt ?? Infinity) > Date.now()),
  );
  return {
    ok: true,
    incognitoAllowed,
    blocked: lockedByAntiMode || (settings.blocked && (settings.suspendedUntil ?? 0) <= Date.now()),
    controlEnabled: settings.blocked,
    suspendedUntil: settings.suspendedUntil,
    lockedByAntiMode,
  };
}

async function setIncognitoControl(blocked: boolean): Promise<AntiModeResponse> {
  const status = await getIncognitoStatus();
  if (!blocked && status.ok && 'lockedByAntiMode' in status && status.lockedByAntiMode) {
    return {
      ok: false,
      message: 'A proteção anônima não pode ser desativada durante um compromisso anti ativo.',
    };
  }
  await chrome.storage.local.set({
    incognitoControl: { blocked },
  });
  return getIncognitoStatus();
}

async function suspendIncognitoControl(minutes: 1 | 5 | 15): Promise<AntiModeResponse> {
  const status = await getIncognitoStatus();
  if (status.ok && 'lockedByAntiMode' in status && status.lockedByAntiMode) {
    return {
      ok: false,
      message: 'O controle anônimo não pode ser suspenso durante um compromisso anti ativo.',
    };
  }
  await chrome.storage.local.set({
    incognitoControl: {
      blocked: true,
      suspendedUntil: Date.now() + minutes * 60_000,
    },
  });
  return getIncognitoStatus();
}

async function closeIncognitoWindowWhenProtected(windowId?: number): Promise<void> {
  if (windowId === undefined) return;
  const status = await getIncognitoStatus();
  if (status.ok && 'blocked' in status && status.blocked) {
    await chrome.windows.remove(windowId);
  }
}

async function expireAntiAccess(alarmName: string): Promise<void> {
  const value = alarmName.slice(ANTI_ACCESS_ALARM_PREFIX.length);
  const separator = value.indexOf(':');
  const mode = value.slice(0, separator);
  const hostname = value.slice(separator + 1);
  await antiMode.synchronize();
  const tabs = await chrome.tabs.query({});
  await Promise.all(
    tabs
      .filter((tab) => tab.id && matchesHostname(tab.url, hostname))
      .map((tab) =>
        chrome.tabs.update(tab.id as number, {
          url: chrome.runtime.getURL(
            `src/entrypoints/blocked/index.html?mode=${mode}&kind=warning&hostname=${encodeURIComponent(hostname)}`,
          ),
        }),
      ),
  );
}

function matchesHostname(value: string | undefined, hostname: string): boolean {
  if (!value) return false;
  try {
    const candidate = new URL(value).hostname.replace(/^www\./, '');
    return candidate === hostname || candidate.endsWith(`.${hostname}`);
  } catch {
    return false;
  }
}

function isIncognitoAllowed(): Promise<boolean> {
  return new Promise((resolve) => chrome.extension.isAllowedIncognitoAccess(resolve));
}

async function getIncognitoSettings(): Promise<{ blocked: boolean; suspendedUntil?: number }> {
  const stored = await chrome.storage.local.get('incognitoControl');
  const value = stored.incognitoControl as
    { blocked?: unknown; suspendedUntil?: unknown } | undefined;
  return {
    blocked: value?.blocked !== false,
    suspendedUntil: typeof value?.suspendedUntil === 'number' ? value.suspendedUntil : undefined,
  };
}

async function handlePermanentRequest(request: Parameters<typeof handlePermanentBlockRequest>[1]) {
  if (request.type !== 'permanent-block/add') {
    return handlePermanentBlockRequest(permanentBlock, request);
  }

  const hostname = parseHostname(request.hostname);
  const standard = (await standardBlock.list()).find((block) => block.hostname === hostname);

  if (standard) await standardBlock.remove(hostname);
  const response = await handlePermanentBlockRequest(permanentBlock, request);

  if (response.ok) {
    void activity.record({
      source: 'permanent',
      kind: 'created',
      hostname,
      path: '/',
    });
  }

  if (!response.ok && standard) {
    await standardBlock.add(standard.hostname, standard.cooldownMilliseconds);
  }

  return response;
}

async function expireStandardAccess(alarmName: string): Promise<void> {
  const hostname = alarmName.slice('standard-block-access:'.length);

  try {
    await standardBlock.synchronize();
    const tabs = await chrome.tabs.query({});
    const affectedTabs = tabs.filter((tab) => {
      if (!tab.id || !tab.url) return false;

      try {
        const tabHostname = new URL(tab.url).hostname.replace(/^www\./, '');
        return tabHostname === hostname || tabHostname.endsWith(`.${hostname}`);
      } catch {
        return false;
      }
    });

    await Promise.all(
      affectedTabs.map((tab) =>
        chrome.tabs.update(tab.id as number, {
          url: chrome.runtime.getURL(
            `src/entrypoints/blocked/index.html?mode=standard&hostname=${encodeURIComponent(hostname)}`,
          ),
        }),
      ),
    );
  } catch (error) {
    console.error('Não foi possível encerrar o acesso temporário.', error);
  }
}
