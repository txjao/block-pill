export interface UsePermanentBlockBlockedModelProps {
  hostname: string | null;
}

export function usePermanentBlockBlockedModel({
  hostname,
}: UsePermanentBlockBlockedModelProps) {
  return { hostname };
}
