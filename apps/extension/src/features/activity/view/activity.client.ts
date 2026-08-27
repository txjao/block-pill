import type { ActivityRequest, ActivityResponse } from '../application/activity.messages';

export async function sendActivityRequest(request: ActivityRequest): Promise<ActivityResponse> {
  try {
    return await chrome.runtime.sendMessage<ActivityRequest, ActivityResponse>(request);
  } catch {
    return { ok: false, message: 'Não foi possível atualizar o histórico local.' };
  }
}
