export class StandardBlockAlreadyExistsError extends Error {
  constructor() {
    super('Este domínio já está na lista de bloqueios padrão.');
    this.name = 'StandardBlockAlreadyExistsError';
  }
}

export class StandardBlockNotFoundError extends Error {
  constructor() {
    super('O domínio não foi encontrado na lista de bloqueios padrão.');
    this.name = 'StandardBlockNotFoundError';
  }
}

export class StandardBlockLimitError extends Error {
  constructor() {
    super('O limite de domínios bloqueados foi atingido.');
    this.name = 'StandardBlockLimitError';
  }
}

export class InvalidCooldownError extends Error {
  constructor() {
    super('O cooldown deve estar entre uma hora e dois anos.');
    this.name = 'InvalidCooldownError';
  }
}

export class TemporaryAccessAlreadyActiveError extends Error {
  constructor() {
    super('Já existe um acesso temporário ativo para este domínio.');
    this.name = 'TemporaryAccessAlreadyActiveError';
  }
}

export class TemporaryAccessCooldownError extends Error {
  constructor(readonly availableAt: number) {
    super('Este domínio está em cooldown.');
    this.name = 'TemporaryAccessCooldownError';
  }
}

export class TemporaryAccessBudgetError extends Error {
  constructor() {
    super('A duração solicitada é maior que o saldo disponível.');
    this.name = 'TemporaryAccessBudgetError';
  }
}

export class InvalidTemporaryAccessDurationError extends Error {
  constructor() {
    super('Escolha um acesso temporário de 1, 5 ou 15 minutos.');
    this.name = 'InvalidTemporaryAccessDurationError';
  }
}
