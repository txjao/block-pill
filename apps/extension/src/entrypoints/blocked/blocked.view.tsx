import type { createBlockedModel } from './blocked.model';

type BlockedModel = ReturnType<typeof createBlockedModel>;

export function BlockedView({ Page }: BlockedModel) {
  return <Page />;
}
