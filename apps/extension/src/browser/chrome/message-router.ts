import { ACTIVITY_MESSAGE_PREFIX } from '@/features/activity';
import {
  ANTI_MODE_MESSAGE_PREFIX,
  INCOGNITO_MESSAGE_PREFIX,
} from '@/features/anti-mode';
import { PERMANENT_BLOCK_MESSAGE_PREFIX } from '@/features/permanent-block';
import { STANDARD_BLOCK_MESSAGE_PREFIX } from '@/features/standard-block';

export type ChromeMessageHandler = (
  message: unknown,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: unknown) => void,
) => boolean;

export interface ChromeMessageHandlers {
  activity: ChromeMessageHandler;
  antiMode: ChromeMessageHandler;
  permanentBlock: ChromeMessageHandler;
  standardBlock: ChromeMessageHandler;
}

export function registerChromeMessageRouter(
  handlers: ChromeMessageHandlers,
): void {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (getMessagePrefix(message)) {
      case STANDARD_BLOCK_MESSAGE_PREFIX:
        return handlers.standardBlock(message, sender, sendResponse);
      case PERMANENT_BLOCK_MESSAGE_PREFIX:
        return handlers.permanentBlock(message, sender, sendResponse);
      case ACTIVITY_MESSAGE_PREFIX:
        return handlers.activity(message, sender, sendResponse);
      case ANTI_MODE_MESSAGE_PREFIX:
      case INCOGNITO_MESSAGE_PREFIX:
        return handlers.antiMode(message, sender, sendResponse);
      default:
        return false;
    }
  });
}

export function invalidMessageResponse(): { ok: false; message: string } {
  return { ok: false, message: 'A mensagem recebida possui dados inválidos.' };
}

function getMessagePrefix(message: unknown): string | undefined {
  if (typeof message !== 'object' || message === null || !('type' in message))
    return undefined;
  if (typeof message.type !== 'string') return undefined;

  const separator = message.type.indexOf('/');
  return separator < 0 ? undefined : message.type.slice(0, separator + 1);
}
