import type { ChromeBrowserContext } from '@/browser/chrome/context';
import { invalidMessageResponse, type ChromeMessageHandler } from '@/browser/chrome/message-router';
import {
  PERMANENT_BLOCK_MESSAGE_TYPE,
  handlePermanentBlockRequest,
  parsePermanentBlockRequest,
  type ParsedPermanentBlockRequest,
  type PermanentBlockResponse,
} from '@/features/permanent-block';
import { matchesHostname, parseHostname } from '@/shared/web-address/domain';

export function registerPermanentBlock(context: ChromeBrowserContext): ChromeMessageHandler {
  chrome.runtime.onInstalled.addListener(() => {
    void synchronizePermanentBlock(context);
  });

  chrome.runtime.onStartup.addListener(() => {
    void synchronizePermanentBlock(context);
  });

  chrome.webNavigation.onBeforeNavigate.addListener((details) => {
    if (details.frameId === 0) {
      void recordPermanentBlockNavigation(context, details.url);
    }
  });

  return (message, _sender, sendResponse) => {
    const request = parsePermanentBlockRequest(message);
    if (!request) {
      sendResponse(invalidMessageResponse());
      return false;
    }

    void handlePermanentRequest(context, request).then(sendResponse);
    return true;
  };
}

async function handlePermanentRequest(
  context: ChromeBrowserContext,
  request: ParsedPermanentBlockRequest,
): Promise<PermanentBlockResponse> {
  if (request.type !== PERMANENT_BLOCK_MESSAGE_TYPE.add) {
    return handlePermanentBlockRequest(context.permanentBlock, request);
  }

  const hostname = parseHostname(request.hostname);
  const standard = (await context.standardBlock.list()).find(
    (block) => block.hostname === hostname,
  );

  if (standard) await context.standardBlock.remove(hostname);
  const response = await handlePermanentBlockRequest(context.permanentBlock, request);

  if (response.ok) {
    await context.activity.record({
      source: 'permanent',
      kind: 'created',
      hostname,
      path: '/',
    });
  } else if (standard) {
    await context.standardBlock.add(standard.hostname, standard.cooldownMilliseconds);
  }

  return response;
}

async function synchronizePermanentBlock(context: ChromeBrowserContext): Promise<void> {
  try {
    await context.permanentBlock.synchronize();
  } catch (error) {
    console.error('Não foi possível sincronizar os bloqueios permanentes.', error);
  }
}

async function recordPermanentBlockNavigation(
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

  const blocks = await context.permanentBlock.list();
  for (const block of blocks) {
    if (matchesHostname(value, block.hostname)) {
      await context.activity.record({
        source: 'permanent',
        kind: 'attempt',
        hostname: block.hostname,
        path,
      });
    }
  }
}
