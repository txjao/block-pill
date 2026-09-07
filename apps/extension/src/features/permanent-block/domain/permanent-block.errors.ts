export class PermanentBlockAlreadyExistsError extends Error {
  constructor() {
    super('Este domínio já está bloqueado permanentemente.');
    this.name = 'PermanentBlockAlreadyExistsError';
  }
}

export class PermanentBlockLimitError extends Error {
  constructor() {
    super('O limite de bloqueios permanentes foi atingido.');
    this.name = 'PermanentBlockLimitError';
  }
}
