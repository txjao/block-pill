# Arquitetura

O Block Pill usa uma arquitetura híbrida: os contextos de execução da extensão
ficam separados das regras de negócio e das integrações com o navegador.

## Diretórios

- `src/entrypoints`: pontos de entrada executados pelo navegador, como service
  worker, popup, configurações, página de bloqueio e futuros content scripts.
- `src/modules`: regras de negócio puras. Bloqueios padrão, permanentes e de
  conteúdo são módulos independentes.
- `src/platform/chrome`: adaptações para APIs do Chrome, criadas somente quando
  forem necessárias.
- `src/shared/ui`: elementos visuais usados por mais de uma página da extensão.

Os content scripts são organizados por site em
`src/entrypoints/content-scripts/<site>`. Uma pasta só deve existir quando o
respectivo site for suportado.

## Dependências

```text
entrypoints -> modules
entrypoints -> platform/chrome
platform/chrome -> contratos dos modules
```

Os módulos de negócio não podem depender de Chrome, Preact, `window` ou
`document`. Essa fronteira permite testar as regras isoladamente com Vitest.

O `background` é o ponto de composição: ele conecta os módulos de negócio às
implementações da plataforma e expõe operações aos outros contextos por
mensagens tipadas.

## Convenções

- Bloqueio padrão e bloqueio permanente permanecem em módulos separados.
- Constantes e tipos derivados ficam próximos da regra que representam.
- Evitamos arquivos genéricos como `constants.ts` e diretórios vagos.
- Código só vai para `shared` quando é utilizado por dois ou mais consumidores.
- Não criamos diretórios ou abstrações antes de existir uma necessidade real.
