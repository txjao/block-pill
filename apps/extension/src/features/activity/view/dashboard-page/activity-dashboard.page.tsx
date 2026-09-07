import type {
  ActivityRequest,
  ActivityResponse,
} from '@/features/activity/application/activity.messages';
import { useActivityDashboardModel } from './activity-dashboard.model';
import { ActivityDashboardView } from './activity-dashboard.view';

function now(): number {
  return Date.now();
}

async function sendMessage(
  request: ActivityRequest,
): Promise<ActivityResponse> {
  try {
    return await chrome.runtime.sendMessage<ActivityRequest, ActivityResponse>(
      request,
    );
  } catch {
    return {
      ok: false,
      message: 'Não foi possível atualizar o histórico local.',
    };
  }
}

export function ActivityDashboardPage() {
  const model = useActivityDashboardModel({ now, sendMessage });
  return <ActivityDashboardView {...model} />;
}
