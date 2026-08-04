# Block Pill

Block Pill é uma extensão de navegador filantrópica e focada em privacidade para ajudar pessoas que desejam reduzir distrações digitais.

## Estado do projeto

O projeto está na fundação técnica. O bloqueio de sites e conteúdos ainda não foi implementado.

A organização do código e as regras de dependência estão descritas em
[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md).

## Princípios

- Funcionar localmente, sem vender ou enviar dados de navegação.
- Criar fricção contra decisões impulsivas sem impedir a desinstalação.
- Manter bloqueios padrão e permanentes como regras de negócio separadas.
- Ser transparente sobre permissões, limitações e comportamento.

## Desenvolvimento

Requisitos: Node.js 20.19 ou superior e pnpm 11.

```bash
pnpm install
pnpm dev
```

O build de produção é gerado em `dist/`:

```bash
pnpm build
```

Para executar testes e validar o pacote:

```bash
pnpm check
```

## Privacidade

Consulte [PRIVACY.md](./PRIVACY.md) para conhecer os compromissos de privacidade do projeto.
