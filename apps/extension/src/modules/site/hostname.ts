declare const hostnameBrand: unique symbol;

export type Hostname = string & { readonly [hostnameBrand]: true };

export class InvalidHostnameError extends Error {
  constructor() {
    super('Informe um domínio válido, como "exemplo.com".');
    this.name = "InvalidHostnameError";
  }
}

export function parseHostname(input: string): Hostname {
  const value = input.trim();

  if (value.length === 0) {
    throw new InvalidHostnameError();
  }

  let url: URL;

  try {
    url = new URL(value.includes("://") ? value : `https://${value}`);
  } catch {
    throw new InvalidHostnameError();
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new InvalidHostnameError();
  }

  const hostname = url.hostname.toLowerCase().replace(/^www\./, "").replace(/\.$/, "");
  const labels = hostname.split(".");
  const isValidLabel = (label: string) =>
    /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label);

  if (
    hostname.length > 253 ||
    labels.length < 2 ||
    labels.some((label) => !isValidLabel(label))
  ) {
    throw new InvalidHostnameError();
  }

  return hostname as Hostname;
}
