import type { useCreateBlockModel } from '@/entrypoints/blocked/blocked.model';

type BlockedModel = ReturnType<typeof useCreateBlockModel>;

export function BlockedView({ Page }: BlockedModel) {
  return <Page />;
}
