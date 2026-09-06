import type { ChromeBrowserContext } from '@/browser/chrome/context';
import {
  invalidMessageResponse,
  type ChromeMessageHandler,
} from '@/browser/chrome/message-router';
import {
  STANDARD_ACCESS_ALARM_PREFIX,
  STANDARD_BLOCK_MESSAGE_TYPE,
  createStandardAccessAlarmName,
  handleStandardBlockRequest,
  parseStandardBlockRequest,
  type ParsedStandardBlockRequest,
  type StandardBlockResponse,
} from '@/features/standard-block';
import { matchesHostname, parseHostname } from '@/shared/web-address/domain';

const STANDARD_BLOCK_CONTEXT_KEY_PREFIX = 'standard-block-context:';

export function registerStandardBlock(
  context: ChromeBrowserContext,
): ChromeMessageHandler {
  chrome.runtime.onInstalled.addListener(() => {
    void synchronizeStandardBlock(context);
  });

  chrome.runtime.onStartup.addListener(() => {
    void synchronizeStandardBlock(context);
  });

  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name.startsWith(STANDARD_ACCESS_ALARM_PREFIX)) {
      void expireStandardAccess(context, alarm.name);
    }
  });

  chrome.webNavigation.onBeforeNavigate.addListener((details) => {
    if (details.frameId === 0) {
      void recordStandardNavigation(context, details.url, details.tabId);
    }
  });

  return (message, sender, sendResponse) => {
    const request = parseStandardBlockRequest(message);
    if (!request) {
      sendResponse(invalidMessageResponse());
      return false;
    }

    void respondToStandardBlockMessage(context, request, sender.tab?.id).then(
      sendResponse,
    );
    return true;
  };
}

async function respondToStandardBlockMessage(
  context: ChromeBrowserContext,
  request: ParsedStandardBlockRequest,
  tabId?: number,
): Promise<StandardBlockResponse> {
  if (request.type === STANDARD_BLOCK_MESSAGE_TYPE.context) {
    return { ok: true, context: await getStandardBlockContext(tabId) };
  }

  const response = await handleStandardRequest(context, request);

  if (
    request.type === STANDARD_BLOCK_MESSAGE_TYPE.requestAccess &&
    response.ok &&
    'snapshot' in response &&
    response.snapshot.activeUntil !== undefined
  ) {
    await chrome.alarms.create(
      createStandardAccessAlarmName(response.snapshot.hostname),
      {
        when: response.snapshot.activeUntil,
      },
    );
    await context.activity.record({
      source: 'standard',
      kind: 'access-granted',
      hostname: response.snapshot.hostname,
      path: '/',
      durationMinutes: request.minutes,
    });
  } else if (
    request.type === STANDARD_BLOCK_MESSAGE_TYPE.add &&
    response.ok &&
    'blocks' in response
  ) {
    await context.activity.record({
      source: 'standard',
      kind: 'created',
      hostname: parseHostname(request.hostname),
      path: '/',
    });
  }

  return response;
}

async function handleStandardRequest(
  context: ChromeBrowserContext,
  request: ParsedStandardBlockRequest,
): Promise<StandardBlockResponse> {
  if (request.type === STANDARD_BLOCK_MESSAGE_TYPE.add) {
    const hostname = parseHostname(request.hostname);
    const permanentExists = (await context.permanentBlock.list()).some(
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

  return handleStandardBlockRequest(context.standardBlock, request);
}

async function synchronizeStandardBlock(
  context: ChromeBrowserContext,
): Promise<void> {
  try {
    await context.standardBlock.synchronize();
    const blocks = await context.standardBlock.list();

    await Promise.all(
      blocks.flatMap((block) =>
        block.temporaryAccess.activeUntil &&
        block.temporaryAccess.activeUntil > context.clock.now()
          ? [
              chrome.alarms.create(
                createStandardAccessAlarmName(block.hostname),
                {
                  when: block.temporaryAccess.activeUntil,
                },
              ),
            ]
          : [],
      ),
    );
  } catch (error) {
    console.error('Não foi possível sincronizar os bloqueios padrão.', error);
  }
}

async function recordStandardNavigation(
  context: ChromeBrowserContext,
  value: string,
  tabId: number,
): Promise<void> {
  let hostname: string;
  let path: string;

  try {
    const url = new URL(value);
    hostname = parseHostname(value);
    path = url.pathname || '/';
  } catch {
    return;
  }

  const standard = (await context.standardBlock.list()).find((block) =>
    matchesHostname(value, block.hostname),
  );
  const isAllowedSubdomain = standard?.allowedSubdomains.some(
    (allowed) => hostname === allowed || hostname.endsWith(`.${allowed}`),
  );

  if (!standard || isAllowedSubdomain) return;

  await chrome.storage.session.set({
    [`${STANDARD_BLOCK_CONTEXT_KEY_PREFIX}${tabId}`]: {
      hostname: standard.hostname,
      attemptedHostname: hostname,
    },
  });

  const status = await context.standardBlock.getStatus(standard.hostname);
  if (status.status !== 'active') {
    await context.activity.record({
      source: 'standard',
      kind: 'attempt',
      hostname: standard.hostname,
      path,
    });
  }
}

async function getStandardBlockContext(
  tabId?: number,
): Promise<{ hostname: string; attemptedHostname: string } | undefined> {
  if (tabId === undefined) return undefined;

  const key = `${STANDARD_BLOCK_CONTEXT_KEY_PREFIX}${tabId}`;
  const result = await chrome.storage.session.get(key);
  const value = result[key];
  if (!value || typeof value !== 'object') return undefined;

  const context = value as Record<string, unknown>;
  if (
    typeof context.hostname !== 'string' ||
    typeof context.attemptedHostname !== 'string'
  ) {
    return undefined;
  }

  return {
    hostname: context.hostname,
    attemptedHostname: context.attemptedHostname,
  };
}

async function expireStandardAccess(
  context: ChromeBrowserContext,
  alarmName: string,
): Promise<void> {
  const hostname = alarmName.slice(STANDARD_ACCESS_ALARM_PREFIX.length);

  try {
    await context.standardBlock.synchronize();
    const tabs = await chrome.tabs.query({});
    const affectedTabs = tabs.filter(
      (tab) => tab.id && matchesHostname(tab.url, hostname),
    );

    await Promise.all(
      affectedTabs.map((tab) =>
        chrome.tabs.update(tab.id, {
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
