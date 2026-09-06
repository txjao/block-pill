import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ACTIVITY_MESSAGE_TYPE } from '@/features/activity';
import {
  ANTI_MODE_MESSAGE_TYPE,
  INCOGNITO_MESSAGE_TYPE,
} from '@/features/anti-mode';
import { PERMANENT_BLOCK_MESSAGE_TYPE } from '@/features/permanent-block';
import { STANDARD_BLOCK_MESSAGE_TYPE } from '@/features/standard-block';
import {
  registerChromeMessageRouter,
  type ChromeMessageHandler,
  type ChromeMessageHandlers,
} from '@/browser/chrome/message-router';

describe('Chrome message router', () => {
  let listener: Parameters<typeof chrome.runtime.onMessage.addListener>[0];
  let handlers: ChromeMessageHandlers;

  beforeEach(() => {
    vi.stubGlobal('chrome', {
      runtime: {
        onMessage: {
          addListener: vi.fn((registered: typeof listener) => {
            listener = registered;
          }),
        },
      },
    });

    handlers = {
      activity: createHandler(),
      antiMode: createHandler(),
      permanentBlock: createHandler(),
      standardBlock: createHandler(),
    };
    registerChromeMessageRouter(handlers);
  });

  it.each([
    [STANDARD_BLOCK_MESSAGE_TYPE.list, 'standardBlock'],
    [PERMANENT_BLOCK_MESSAGE_TYPE.list, 'permanentBlock'],
    [ACTIVITY_MESSAGE_TYPE.list, 'activity'],
    [ANTI_MODE_MESSAGE_TYPE.list, 'antiMode'],
    [INCOGNITO_MESSAGE_TYPE.status, 'antiMode'],
  ] as const)('direciona %s somente para %s', (type, destination) => {
    const message = { type };
    const sender = {} as chrome.runtime.MessageSender;
    const sendResponse = vi.fn();

    const result = listener(message, sender, sendResponse);

    expect(result).toBe(true);
    expect(handlers[destination]).toHaveBeenCalledWith(
      message,
      sender,
      sendResponse,
    );
    for (const [name, handler] of Object.entries(handlers)) {
      expect(handler).toHaveBeenCalledTimes(name === destination ? 1 : 0);
    }
  });

  it('ignora mensagens que não pertencem às features registradas', () => {
    const result = listener({ type: 'unknown/list' }, {}, vi.fn());

    expect(result).toBe(false);
    for (const handler of Object.values(handlers)) {
      expect(handler).not.toHaveBeenCalled();
    }
  });
});

function createHandler(): ChromeMessageHandler {
  return vi.fn(() => true);
}
