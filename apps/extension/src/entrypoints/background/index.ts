import {
  isStandardBlockingRequest,
  type StandardBlockingRequest,
  type StandardBlockingResponse
} from "../../contracts/standard-blocking-messages";
import { StandardBlockingService } from "../../modules/standard-blocking";
import { ChromeStandardBlockRuleManager } from "../../platform/chrome/rules/chrome-standard-block-rule-manager";
import { ChromeStandardBlockStore } from "../../platform/chrome/storage/chrome-standard-block-store";

const standardBlocking = new StandardBlockingService(
  new ChromeStandardBlockStore(),
  new ChromeStandardBlockRuleManager()
);

chrome.runtime.onInstalled.addListener(() => {
  void synchronizeRules();
});

chrome.runtime.onStartup.addListener(() => {
  void synchronizeRules();
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!isStandardBlockingRequest(message)) {
    return;
  }

  void handleMessage(message).then(sendResponse);
  return true;
});

async function handleMessage(
  request: StandardBlockingRequest
): Promise<StandardBlockingResponse> {
  try {
    if (request.type === "standard-blocking/add") {
      await standardBlocking.add(request.hostname);
    } else if (request.type === "standard-blocking/remove") {
      await standardBlocking.remove(request.hostname);
    }

    return { ok: true, blocks: await standardBlocking.list() };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar os bloqueios."
    };
  }
}

async function synchronizeRules(): Promise<void> {
  try {
    await standardBlocking.synchronize();
  } catch (error) {
    console.error("Não foi possível sincronizar os bloqueios padrão.", error);
  }
}
