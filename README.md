# Block Pill

Block Pill é uma extensão de navegador filantrópica e focada em privacidade para ajudar pessoas que desejam reduzir distrações digitais.

O repositório também contém a landing page pública do projeto.

## Estado do projeto

Os fluxos de bloqueio padrão, permanente, anti-pornografia e anti-aposta estão
integrados às APIs Manifest V3. A extensão oferece liberações temporárias,
cooldown por domínio, proteção anônima autorizada pelo usuário, reflexões locais
e um dashboard de tentativas e progresso.

A organização do código e as regras de dependência estão descritas em
[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md).
As regras de produto já validadas estão em
[docs/BLOCKING_RULES.md](./docs/BLOCKING_RULES.md).
O roteiro de validação manual e automatizada está em
[docs/TEST_PLAN.md](./docs/TEST_PLAN.md).

## Estrutura

```text
apps/
├── extension/  # Extensão Manifest V3
└── web/        # Landing page publicada na Vercel
shared/
├── brand/      # Identidade visual consumida pelas duas aplicações
└── ui/         # Implementações de interface consumidas pelas duas aplicações
```

O workspace é coordenado por pnpm. Cada aplicação possui configuração, scripts,
dependências e diretório de build próprios.

## Princípios

- Funcionar localmente, sem vender ou enviar dados de navegação.
- Criar fricção contra decisões impulsivas sem impedir a desinstalação.
- Manter bloqueios padrão e permanentes como regras de negócio separadas.
- Ser transparente sobre permissões, limitações e comportamento.

## Desenvolvimento

Requisitos: Node.js 20.19 ou superior e pnpm 11.

```bash
pnpm install
```

Para iniciar a landing page:

```bash
pnpm dev:web
```

Para observar o build da extensão:

```bash
pnpm dev:extension
```

Para validar as duas aplicações:

```bash
pnpm check
```

Os artefatos são gerados separadamente em `apps/web/dist` e
`apps/extension/dist`.

## Vercel

Crie um projeto Vercel apontando a Root Directory para `apps/web`. O preset é
Vite, o comando de build é `pnpm build` e o diretório de saída é `dist`.

## Privacidade

Consulte [PRIVACY.md](./PRIVACY.md) para conhecer os compromissos de privacidade do projeto.
