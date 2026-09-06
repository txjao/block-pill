import type { ChromeBrowserContext } from '@/browser/chrome/context';
import {
  invalidMessageResponse,
  type ChromeMessageHandler,
} from '@/browser/chrome/message-router';
import {
  ANTI_MODE_ACCESS_ALARM_PREFIX,
  ANTI_MODE_MESSAGE_TYPE,
  INCOGNITO_MESSAGE_TYPE,
  handleAntiModeRequest,
  parseAntiModeRequest,
  type AntiModeResponse,
  type ParsedAntiModeRequest,
} from '@/features/anti-mode';
import { matchesHostname, parseHostname } from '@/shared/web-address/domain';

const INCOGNITO_CONTROL_STORAGE_KEY = 'incognitoControl';

export function registerAntiMode(
  context: ChromeBrowserContext,
): ChromeMessageHandler {
  chrome.runtime.onInstalled.addListener(() => {
    void synchronizeAntiMode(context);
  });

  chrome.runtime.onStartup.addListener(() => {
    void synchronizeAntiMode(context);
  });

  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name.startsWith(ANTI_MODE_ACCESS_ALARM_PREFIX)) {
      void expireAntiAccess(context, alarm.name);
    }
  });

  chrome.windows.onCreated.addListener((window) => {
    if (window.incognito) {
      void closeIncognitoWindowWhenProtected(context, window.id);
    }
  });

  chrome.webNavigation.onBeforeNavigate.addListener((details) => {
    if (details.frameId === 0) {
      void recordAntiModeNavigation(context, details.url);
    }
  });

  return (message, _sender, sendResponse) => {
    const request = parseAntiModeRequest(message);
    if (!request) {
      sendResponse(invalidMessageResponse());
      return false;
    }

    void handleAntiRequest(context, request).then(sendResponse);
    return true;
  };
}

async function handleAntiRequest(
  context: ChromeBrowserContext,
  request: ParsedAntiModeRequest,
): Promise<AntiModeResponse> {
  if (request.type === INCOGNITO_MESSAGE_TYPE.status)
    return getIncognitoStatus(context);

  if (request.type === INCOGNITO_MESSAGE_TYPE.openSettings) {
    await chrome.tabs.create({
      url: `chrome://extensions/?id=${chrome.runtime.id}`,
    });
    return getIncognitoStatus(context);
  }

  if (request.type === INCOGNITO_MESSAGE_TYPE.suspend) {
    return suspendIncognitoControl(context, request.minutes);
  }

  if (request.type === INCOGNITO_MESSAGE_TYPE.setControl) {
    return setIncognitoControl(context, request.blocked);
  }

  if (
    request.type === ANTI_MODE_MESSAGE_TYPE.activate &&
    !(await isIncognitoAllowed())
  ) {
    return {
      ok: false,
      permissionRequired: true,
      message:
        'O acesso ao modo anônimo é estritamente necessário para ativar um modo anti.',
    };
  }

  const response = await handleAntiModeRequest(context.antiMode, request);
  if (
    request.type === ANTI_MODE_MESSAGE_TYPE.grantAccess &&
    response.ok &&
    'configs' in response &&
    response.activeUntil !== undefined
  ) {
    await chrome.alarms.create(
      createAntiAccessAlarmName(request.mode, request.hostname),
      {
        when: response.activeUntil,
      },
    );
  }

  return response;
}

async function synchronizeAntiMode(
  context: ChromeBrowserContext,
): Promise<void> {
  try {
    await context.antiMode.synchronize();
    const configs = await context.antiMode.list();

    await Promise.all(
      configs.flatMap((config) =>
        Object.entries(config.accessUntilByHostname).flatMap(
          ([hostname, activeUntil]) =>
            activeUntil > context.clock.now()
              ? [
                  chrome.alarms.create(
                    createAntiAccessAlarmName(config.id, hostname),
                    {
                      when: activeUntil,
                    },
                  ),
                ]
              : [],
        ),
      ),
    );
  } catch (error) {
    console.error('Não foi possível sincronizar os modos anti.', error);
  }
}

async function recordAntiModeNavigation(
  context: ChromeBrowserContext,
  value: string,
): Promise<void> {
  let path: string;

  try {
    path = new URL(value).pathname || '/';
    parseHostname(value);
  } catch {
    return;
  }

  const configs = await context.antiMode.list();
  for (const config of configs) {
    if (!config.enabled) continue;

    const matched = [...config.domains, ...config.warningDomains].find(
      (domain) => matchesHostname(value, domain),
    );
    if (
      matched &&
      (config.accessUntilByHostname[matched] ?? 0) <= context.clock.now()
    ) {
      await context.activity.record({
        source: config.id,
        kind: 'attempt',
        hostname: matched,
        path,
      });
    }
  }
}

async function getIncognitoStatus(
  context: ChromeBrowserContext,
): Promise<AntiModeResponse> {
  const [incognitoAllowed, settings, configs] = await Promise.all([
    isIncognitoAllowed(),
    getIncognitoSettings(),
    context.antiMode.list(),
  ]);
  const lockedByAntiMode = configs.some(
    (config) =>
      config.enabled &&
      (config.permanent ||
        (config.commitmentEndsAt ?? Infinity) > context.clock.now()),
  );

  return {
    ok: true,
    incognitoAllowed,
    blocked:
      lockedByAntiMode ||
      (settings.blocked &&
        (settings.suspendedUntil ?? 0) <= context.clock.now()),
    controlEnabled: settings.blocked,
    suspendedUntil: settings.suspendedUntil,
    lockedByAntiMode,
  };
}

async function setIncognitoControl(
  context: ChromeBrowserContext,
  blocked: boolean,
): Promise<AntiModeResponse> {
  const status = await getIncognitoStatus(context);
  if (
    !blocked &&
    status.ok &&
    'lockedByAntiMode' in status &&
    status.lockedByAntiMode
  ) {
    return {
      ok: false,
      message:
        'A proteção anônima não pode ser desativada durante um compromisso anti ativo.',
    };
  }

  await chrome.storage.local.set({
    [INCOGNITO_CONTROL_STORAGE_KEY]: { blocked },
  });
  return getIncognitoStatus(context);
}

async function suspendIncognitoControl(
  context: ChromeBrowserContext,
  minutes: 1 | 5 | 15,
): Promise<AntiModeResponse> {
  const status = await getIncognitoStatus(context);
  if (status.ok && 'lockedByAntiMode' in status && status.lockedByAntiMode) {
    return {
      ok: false,
      message:
        'O controle anônimo não pode ser suspenso durante um compromisso anti ativo.',
    };
  }

  await chrome.storage.local.set({
    [INCOGNITO_CONTROL_STORAGE_KEY]: {
      blocked: true,
      suspendedUntil: context.clock.now() + minutes * 60_000,
    },
  });
  return getIncognitoStatus(context);
}

async function closeIncognitoWindowWhenProtected(
  context: ChromeBrowserContext,
  windowId?: number,
): Promise<void> {
  if (windowId === undefined) return;

  const status = await getIncognitoStatus(context);
  if (status.ok && 'blocked' in status && status.blocked) {
    await chrome.windows.remove(windowId);
  }
}

async function expireAntiAccess(
  context: ChromeBrowserContext,
  alarmName: string,
): Promise<void> {
  const value = alarmName.slice(ANTI_MODE_ACCESS_ALARM_PREFIX.length);
  const separator = value.indexOf(':');
  if (separator < 0) return;

  const mode = value.slice(0, separator);
  const hostname = value.slice(separator + 1);
  await context.antiMode.synchronize();
  const tabs = await chrome.tabs.query({});

  await Promise.all(
    tabs
      .filter((tab) => tab.id && matchesHostname(tab.url, hostname))
      .map((tab) =>
        chrome.tabs.update(tab.id, {
          url: chrome.runtime.getURL(
            `src/entrypoints/blocked/index.html?mode=${mode}&kind=warning&hostname=${encodeURIComponent(hostname)}`,
          ),
        }),
      ),
  );
}

function createAntiAccessAlarmName(mode: string, hostname: string): string {
  return `${ANTI_MODE_ACCESS_ALARM_PREFIX}${mode}:${hostname}`;
}

function isIncognitoAllowed(): Promise<boolean> {
  return new Promise((resolve) =>
    chrome.extension.isAllowedIncognitoAccess(resolve),
  );
}

async function getIncognitoSettings(): Promise<{
  blocked: boolean;
  suspendedUntil?: number;
}> {
  const stored = await chrome.storage.local.get(INCOGNITO_CONTROL_STORAGE_KEY);
  const value = stored[INCOGNITO_CONTROL_STORAGE_KEY] as
    { blocked?: unknown; suspendedUntil?: unknown } | undefined;

  return {
    blocked: value?.blocked !== false,
    suspendedUntil:
      typeof value?.suspendedUntil === 'number'
        ? value.suspendedUntil
        : undefined,
  };
}
