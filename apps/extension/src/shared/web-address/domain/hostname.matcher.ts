import { parseHostname } from './hostname.parser';

export function matchesHostname(value: string | undefined, hostname: string): boolean {
  if (!value) return false;

  try {
    const candidate = parseHostname(value);
    return candidate === hostname || candidate.endsWith(`.${hostname}`);
  } catch {
    return false;
  }
}
