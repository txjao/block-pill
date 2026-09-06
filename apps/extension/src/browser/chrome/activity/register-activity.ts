import { handleActivityRequest, parseActivityRequest } from '@/features/activity';
import type { ChromeBrowserContext } from '@/browser/chrome/context';
import { invalidMessageResponse, type ChromeMessageHandler } from '@/browser/chrome/message-router';

export function registerActivity(context: ChromeBrowserContext): ChromeMessageHandler {
  return (message, _sender, sendResponse) => {
    const request = parseActivityRequest(message);
    if (!request) {
      sendResponse(invalidMessageResponse());
      return false;
    }

    void handleActivityRequest(context.activity, request).then(sendResponse);
    return true;
  };
}
