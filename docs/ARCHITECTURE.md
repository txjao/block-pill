# Arquitetura

O Block Pill é um workspace pnpm com duas aplicações independentes: a landing
page pública e a extensão de navegador.

## Diretórios do workspace

- `apps/web`: landing page React/Vite preparada para deploy na Vercel.
- `apps/extension`: extensão Manifest V3 e suas regras de negócio.
- `docs`: decisões de produto e arquitetura comuns ao repositório.
- `shared/brand`: identidade visual consumida pelas duas aplicações.

As aplicações não importam código uma da outra. Código só deve sair de uma
aplicação quando já possuir consumidores concretos em mais de uma aplicação.

## Recortes funcionais na extensão

Cada funcionalidade fica em `apps/extension/src/features/<feature>` e contém
tudo o que pertence a esse recorte do produto:

```text
features/
├── standard-block/
│   ├── application/
│   ├── domain/
│   ├── infrastructure/
│   ├── tests/
│   ├── view/
│   └── index.ts
├── permanent-block/
    ├── application/
    ├── domain/
    ├── infrastructure/
    ├── tests/
    ├── view/
│   └── index.ts
├── anti-mode/       # motor compartilhado dos compromissos
├── anti-porn/       # dados específicos da categoria
├── anti-bet/        # dados específicos da categoria
├── activity/        # histórico local e dashboard
└── browser-runtime/ # composição das APIs Chrome e dos slices
```

Pastas vazias não são criadas antecipadamente. O motor `anti-mode` concentra as
regras idênticas dos dois compromissos, enquanto listas e decisões específicas
permanecem nos slices `anti-porn` e `anti-bet`.

As responsabilidades internas são:

- `domain`: valores, regras de negócio, constantes, schemas semânticos e
  contratos necessários para executar essas regras;
- `application`: controllers, casos de uso e mensagens que coordenam o domínio;
- `infrastructure`: implementações de contratos para Chrome, armazenamento ou
  outras APIs externas;
- `view`: página, View, Model e componentes específicos do slice;
- `tests`: testes comportamentais do slice;
- `index.ts`: interface pública pequena do módulo.

### O significado de Domain

Domain é a área do problema que o software representa. Um modelo de domínio é
uma seleção dos conceitos e regras relevantes dessa área; a camada `domain` é a
fronteira usada no código para manter esse modelo independente da interface e
do Chrome.

No Block Pill, regras de cooldown, compromissos, orçamento de acesso temporário,
normalização de domínios e limites de configuração pertencem a essa camada. Elas
são representadas diretamente por tipos, schemas, funções e serviços, sem exigir
classes para todo conceito.

Uma feature não é automaticamente um Bounded Context. Em Domain-Driven Design,
um Bounded Context é uma fronteira dentro da qual um modelo e sua linguagem têm
significado consistente. As pastas em `features/` são inicialmente recortes
funcionais; só devem ser descritas como Bounded Contexts quando suas fronteiras
de linguagem, modelo e integração tiverem sido analisadas.

O estudo de domínios em engenharia de software antecede Domain-Driven Design:
James Neighbors descreveu domain analysis em 1980, FODA sistematizou análise de
comunalidades e variabilidades em 1990, e Eric Evans consolidou o vocabulário de
Domain-Driven Design em 2003. Referências:

- [The Draco Approach to Constructing Software from Reusable Components](https://escholarship.org/uc/item/5687j6g6);
- [Feature-Oriented Domain Analysis](https://www.sei.cmu.edu/library/feature-oriented-domain-analysis-foda-feasibility-study/);
- [Domain-Driven Design Reference](https://www.domainlanguage.com/ddd/reference/);
- [Domain Model, por Martin Fowler](https://martinfowler.com/eaaCatalog/domainModel.html).

### Responsabilidade dos schemas

A localização de um schema é definida pelo dado validado, não pela biblioteca
usada para validá-lo:

| Local                                | Responsabilidade                         | Exemplo                                 |
| ------------------------------------ | ---------------------------------------- | --------------------------------------- |
| `domain/*.schema.ts`                 | valores e invariantes de negócio         | hostname, cooldown, duração permitida   |
| `application/*.messages.schema.ts`   | envelope de comandos e consultas         | `type` e payload de uma mensagem        |
| `infrastructure/*.storage.schema.ts` | formato externo quando difere do domínio | versão ou migração de dados persistidos |

Schemas de mensagem reutilizam schemas semânticos do domínio. A infraestrutura
valida dados desconhecidos ao lê-los e também impede a persistência de modelos
inválidos. Erros internos do Zod não fazem parte do contrato das Views; cada
fronteira devolve uma mensagem estável da aplicação ou do domínio.

## Módulos profundos e interface simples

Detalhes permanecem dentro do slice. Quem o consome usa uma API curta, enquanto
o controller orquestra serviço e adapta a resposta para a interface:

```ts
const controller = new StandardBlockController(
  new StandardBlockService(repository, ruleManager, clock),
);

await controller.add('https://www.youtube.com/watch?v=123');
```

Nesse exemplo, normalização do hostname, prevenção de duplicidade, alocação da
regra, persistência, atualização das regras Chrome e rollback ficam ocultos no
serviço. O consumidor não precisa reproduzir essas decisões.

## Interface: View, Model e Page

A interface segue uma separação inspirada em MVVM:

```text
Page -> Model -> mensagens/controller
  └──> View
```

- `standard-block.page.tsx` compõe Model e View;
- `standard-block.model.ts` mantém estado e traduz ações da interface;
- `standard-block.view.tsx` renderiza as propriedades recebidas.

A própria View deriva o tipo de suas propriedades do Model:

```ts
type StandardBlockModel = ReturnType<typeof useStandardBlockModel>;

export function StandardBlockView(props: StandardBlockModel) {
  const { blocks, addBlock, removeBlock } = props;
  // renderização
}
```

Isso evita manter manualmente uma segunda interface de props. A View ainda
desestrutura `props` no corpo para deixar as dependências visíveis.

Componentes específicos de uma tela são extraídos prioritariamente quando
precisam de testes isolados ou quando a extração reduz claramente a
responsabilidade da View principal. Reuso, comportamento próprio e múltiplos
estados são sinais auxiliares; número de linhas, sozinho, não decide a extração.
Elementos pequenos que apenas envolvem uma tag e uma classe permanecem na View.

Cada superfície mantém seu CSS Module ao lado da View. Uma pasta `styles/` não é
criada para um único arquivo, e um componente extraído mantém seu próprio CSS
Module somente quando também possui estilos sob sua responsabilidade.

## Entrypoints

`src/entrypoints` contém os arquivos exigidos pelo navegador ou pelo bundler:
service worker (`background`), popup, configurações e página de bloqueio. Um
entrypoint inicia um contexto e compõe dependências; ele não contém regras de
negócio.

O `background` chama somente `registerChromeBrowserRuntime()`. O slice
`browser-runtime` é o ponto de composição do contexto de serviço: cria os
adapters Chrome, serviços e controllers, sincroniza regras e alarmes na
instalação/inicialização, registra navegações sanitizadas e encaminha mensagens
tipadas das páginas da extensão. Assim, o entrypoint permanece fino sem misturar
as regras internas de cada slice.

Content scripts futuros permanecem em
`src/entrypoints/content-scripts/<site>` e delegam comportamento aos slices.

## Imports e composição do build

Imports estáticos são o padrão para páginas, componentes e slices da extensão.
As seções atuais de Bloqueios e Modos anti não justificam uma etapa assíncrona de
carregamento.

Cada `index.ts` expõe somente a interface pública necessária do slice. Ele não
deve reexportar indiscriminadamente View, domínio, aplicação e infraestrutura.
Entrypoints consomem a interface pública do slice e não atravessam suas camadas
internas.

O Vite pode mover código usado por mais de um entrypoint para um chunk
compartilhado. A existência desse arquivo não representa, por si só, um problema
de performance. Imports dinâmicos somente serão adotados quando uma medição
demonstrar custo relevante de inicialização ou de interpretação de código.

Qualquer proposta de carregamento dinâmico deve registrar:

- tamanho do build antes e depois;
- entrypoints afetados;
- tempo de inicialização observado;
- estado de carregamento e tratamento de falha introduzidos;
- benefício que compensa a complexidade adicional.

## Dependências

```text
entrypoint -> browser-runtime -> feature/application
browser-runtime -> feature/infrastructure -> feature/domain
feature/view -> feature/application
feature/domain -> shared sem dependências de plataforma
```

O domínio não depende de Chrome, Preact, `window` ou `document`. As adaptações
Chrome implementam contratos declarados pelo domínio, permitindo testes com
implementações em memória.

`apps/extension/src/shared` contém apenas utilidades reutilizadas por mais de um
slice, como parsing de hostname e relógio. Um tipo ou constante usado por apenas
um domínio permanece dentro dele.

## Tokens e estilos da interface

A identidade visual e a estilização da extensão seguem quatro camadas:

```text
tokens da marca -> tokens semânticos da extensão -> CSS Modules -> variant
```

- `shared/brand/tokens.css` contém somente fundamentos compartilhados da marca;
- a extensão traduz esses fundamentos em papéis semânticos, como canvas, texto,
  ação, borda, foco e feedback;
- CSS global fica restrito a fonte, reset, tokens e comportamento de documento;
- cada componente mantém seu layout e seus estados em um CSS Module;
- componentes recebem diferenças visuais por `variant`, não por `tone`;
- valores brutos de cor não são repetidos dentro de componentes quando existe um
  token semântico equivalente.

### Organização dos componentes

Os componentes reutilizáveis da extensão ficam em
`apps/extension/src/shared/ui/components/<componente>`. Cada diretório mantém o
TSX e seu CSS Module lado a lado. Views importam componentes por esse limite e
não importam Radix diretamente.

Primitives com comportamento complexo, como diálogo, abas e switch, são
encapsulados pelos componentes compartilhados. Atualmente esses wrappers usam
Radix com `preact/compat`. Essa dependência não altera o contrato das Views e
pode ser substituída sem atravessar os vertical slices.

O botão animado compartilhado entre a landing e a extensão permanece separado
do botão base da extensão. A nova interface usa o botão simples; a animação não
é transformada em comportamento implícito de toda ação.

### Dados estáticos durante o refactor

Mocks visuais ficam próximos ao Model da superfície, nunca dentro do domínio,
controller ou infraestrutura. Eles mantêm o formato esperado pela View e só
preenchem estados sem contrato real. Dados e fluxos já existentes continuam
usando as mensagens da extensão.

As lacunas conhecidas do handoff ficam documentadas em
`.new_features/design_handoff_block_pill_interfaces/DYNAMIC_INTERFACE_REQUIREMENTS.md`.

WCAG 2.2 AA é o requisito obrigatório: contraste mínimo de `4.5:1` para texto
normal e `3:1` para texto grande, controles e indicadores significativos. O nível
AAA de `7:1` é aplicado quando surgir naturalmente, sem comprometer identidade,
clareza ou manutenção.

Cor nunca é o único indicador de estado. Erro, sucesso, aviso, seleção e bloqueio
também usam texto, ícone, borda, forma ou outro sinal perceptível. O foco possui
tratamento próprio para superfícies claras e escuras, e movimentos não essenciais
respeitam `prefers-reduced-motion`.

## Convenções de nomes

- O domínio usa hífen: `standard-block`, `permanent-block`.
- A responsabilidade usa ponto: `standard-block.service.ts`,
  `standard-block.rule-manager.ts`, `standard-block.model.ts`.
- Evitamos variantes como `standard-block-rule-manager.ts`.
- Constantes ficam em `<domínio>.constants.ts` dentro do slice; só são movidas
  para `shared` após reutilização real entre domínios.
- Bloqueio padrão e bloqueio permanente nunca compartilham o mesmo serviço ou
  intervalo de IDs de regras.

## Builds

- `apps/web/dist`: site estático da landing page.
- `apps/extension/dist`: extensão validada contra o manifesto.
- `pnpm check`: executa testes, tipos e builds dos projetos.
