import { useActivityDashboardModel } from './activity-dashboard.model';
import { ActivityDashboardView } from './activity-dashboard.view';

export function ActivityDashboardPage() {
  const model = useActivityDashboardModel();
  return <ActivityDashboardView {...model} />;
}
