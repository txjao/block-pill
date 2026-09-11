export class AntiModeCommitmentError extends Error {
  constructor() {
    super('Este compromisso ainda está ativo e não pode ser desativado.');
    this.name = 'AntiModeCommitmentError';
  }
}

export class AntiModeDurationError extends Error {
  constructor() {
    super('O compromisso deve durar entre um dia e 732 dias.');
    this.name = 'AntiModeDurationError';
  }
}
