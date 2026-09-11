import { matchesHostname, parseHostname } from '@/shared/web-address/domain';
import type { StandardBlock } from '../../domain/standard-block.types';

export function resolveReturnUrl(
  hostname: string,
  context?: {
    hostname: string;
    attemptedHostname: string;
    originalUrl?: string;
  },
): string {
  const fallback = `https://${parseHostname(hostname)}`;
  if (context?.hostname !== hostname) return fallback;
  if (context.originalUrl) {
    try {
      const url = new URL(context.originalUrl);
      if (
        ['http:', 'https:'].includes(url.protocol) &&
        !url.username &&
        !url.password &&
        matchesHostname(url.href, hostname)
      ) {
        return url.href;
      }
    } catch {
      /* Fall back to the validated hostname. */
    }
  }
  return matchesHostname(context.attemptedHostname, hostname)
    ? `https://${parseHostname(context.attemptedHostname)}`
    : fallback;
}

export function hasStandardBlock(
  url: string,
  blocks: readonly StandardBlock[],
): boolean {
  return blocks.some(
    (block) =>
      matchesHostname(url, block.hostname) &&
      !block.allowedSubdomains.some((allowed) => matchesHostname(url, allowed)),
  );
}
