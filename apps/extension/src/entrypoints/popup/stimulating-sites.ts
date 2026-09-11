import catalog from './data/stimulating-sites.json';
import { parseHostname } from '@/shared/web-address/domain';

export interface StimulatingSitesCatalog {
  version: number;
  domains: readonly string[];
}

export function createStimulatingDomainSet(
  data: StimulatingSitesCatalog,
): ReadonlySet<string> {
  if (!Number.isInteger(data.version) || data.version < 1) {
    throw new Error('A versão do catálogo de estimulantes é inválida.');
  }

  const domains = new Set<string>();
  data.domains.forEach((domain) => {
    const hostname = parseHostname(domain);
    if (domains.has(hostname)) {
      throw new Error(`O domínio ${hostname} está duplicado no catálogo.`);
    }
    domains.add(hostname);
  });
  return domains;
}

export function isStimulatingHostname(
  value: string,
  domains: ReadonlySet<string>,
): boolean {
  const hostname = parseHostname(value);
  const labels = hostname.split('.');

  for (let index = 0; index <= labels.length - 2; index += 1) {
    if (domains.has(labels.slice(index).join('.'))) return true;
  }

  return false;
}

export const stimulatingDomains = createStimulatingDomainSet(catalog);
