# Arquitetura

O Block Pill é um workspace pnpm com duas aplicações independentes: a landing
page pública e a extensão de navegador.

## Diretórios

- `apps/web`: landing page Preact/Vite preparada para deploy na Vercel.
- `apps/extension`: pacote Manifest V3 e suas regras de negócio.
- `docs`: decisões de arquitetura comuns ao repositório.
- `shared/brand`: fontes oficiais da identidade visual consumidas pelas duas
  aplicações; não contém comportamento específico de uma delas.

Dentro de `apps/extension`:

- `src/entrypoints`: pontos de entrada executados pelo navegador, como service
  worker, popup, configurações, página de bloqueio e futuros content scripts.
- `src/modules`: regras de negócio puras. Bloqueios padrão, permanentes e de
  conteúdo são módulos independentes.
- `src/platform/chrome`: adaptações para APIs do Chrome, criadas somente quando
  forem necessárias.
- `src/shared/ui`: elementos visuais usados por mais de uma página da extensão.

Os content scripts são organizados por site em
`apps/extension/src/entrypoints/content-scripts/<site>`.

## Dependências

```text
apps/web ───────────────────────> Preact + DOM
apps/web ───────────────────────> shared/brand
apps/extension/shared/ui ───────> shared/brand

apps/extension/entrypoints -> modules
apps/extension/entrypoints -> platform/chrome
apps/extension/platform/chrome -> contratos dos modules
```

Os módulos de negócio não podem depender de Chrome, Preact, `window` ou
`document`. Essa fronteira permite testar as regras isoladamente com Vitest.

O `background` é o ponto de composição: ele conecta os módulos de negócio às
implementações da plataforma e expõe operações aos outros contextos por
mensagens tipadas.

As aplicações não importam código uma da outra. Ambas podem consumir assets de
`shared/brand`. Um pacote executável em `packages/` só deve ser criado quando
existir reutilização concreta de código entre dois consumidores.

## Builds

- `apps/web/dist`: site estático da landing page.
- `apps/extension/dist`: extensão validada contra o manifesto.
- `pnpm check`: executa as verificações dos dois projetos.

## Convenções

- Bloqueio padrão e bloqueio permanente permanecem em módulos separados.
- Constantes e tipos derivados ficam próximos da regra que representam.
- Evitamos arquivos genéricos como `constants.ts` e diretórios vagos.
- Código só vai para `shared` quando é utilizado por dois ou mais consumidores.
- Não criamos diretórios ou abstrações antes de existir uma necessidade real.
- `apps/extension/src/shared` continua sendo interno à extensão; `shared/` na
  raiz é reservado ao que possui consumidores em aplicações diferentes.
- A landing não depende de APIs ou artefatos internos da extensão.
