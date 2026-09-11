import type { StandardBlock } from '@/features/standard-block';
import { matchesHostname, parseHostname } from '@/shared/web-address/domain';
import { isStimulatingHostname } from './stimulating-sites';

export type PopupSiteClassification =
  | { kind: 'outside'; hostname: string }
  | { kind: 'stimulating'; hostname: string }
  | { kind: 'paused'; hostname: string };

export function resolvePopupSiteClassification({
  currentUrl,
  standardBlocks,
  stimulatingDomains,
}: {
  currentUrl: string | undefined;
  standardBlocks: readonly StandardBlock[];
  stimulatingDomains: ReadonlySet<string>;
}): PopupSiteClassification {
  const hostname = readCurrentHostname(currentUrl);
  if (!hostname) return { kind: 'outside', hostname: 'site atual' };

  const matchingBlock = [...standardBlocks]
    .sort((left, right) => right.hostname.length - left.hostname.length)
    .find((block) => matchesHostname(hostname, block.hostname));

  if (matchingBlock)
    return { kind: 'paused', hostname: matchingBlock.hostname };
  if (isStimulatingHostname(hostname, stimulatingDomains)) {
    return { kind: 'stimulating', hostname };
  }

  return { kind: 'outside', hostname };
}

export function readCurrentHostname(
  value: string | undefined,
): string | undefined {
  if (!value) return undefined;

  try {
    const url = new URL(value);
    if (url.protocol === 'chrome-extension:') {
      const blockedHostname = url.searchParams.get('hostname');
      return blockedHostname ? parseHostname(blockedHostname) : undefined;
    }
    return parseHostname(value);
  } catch {
    return undefined;
  }
}

export function createSettingsPath(
  parameters: Record<string, string | undefined>,
): string {
  const search = new URLSearchParams();
  Object.entries(parameters).forEach(([key, value]) => {
    if (value) search.set(key, value);
  });
  return `src/entrypoints/settings/index.html?${search.toString()}`;
}
