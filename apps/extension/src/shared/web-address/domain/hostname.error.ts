export class InvalidHostnameError extends Error {
  constructor() {
    super('Informe um domínio válido, como "exemplo.com".');
    this.name = 'InvalidHostnameError';
  }
}
