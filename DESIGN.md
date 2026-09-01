---
name: Block Pill
description: Fricção consciente para uma navegação com mais intenção.
colors:
  brand-red: '#FF2C2C'
  brand-black: '#000000'
  brand-white: '#FFFFFF'
  canvas-warm: '#FAF8F5'
  surface: '#FFFFFF'
  text-primary: '#171717'
  text-secondary: '#3D3D3D'
  text-muted: '#525252'
  border-control: '#8C8C8C'
  action-hover: '#E51F1F'
  danger-text: '#9D1C20'
  danger-surface: '#FFF0F0'
  success-text: '#075C25'
  success-surface: '#E7F8EC'
  warning-text: '#6A4100'
  warning-surface: '#FFF2CE'
typography:
  display:
    fontFamily: 'Bricolage Grotesque, Segoe UI Variable, sans-serif'
    fontSize: 'clamp(3.55rem, 7vw, 6rem)'
    fontWeight: 770
    lineHeight: 0.95
    letterSpacing: '-0.04em'
  body:
    fontFamily: 'Bricolage Grotesque, Segoe UI Variable, sans-serif'
    fontSize: 'clamp(1.08rem, 1.6vw, 1.3rem)'
    lineHeight: 1.55
  interface:
    fontFamily: 'Bricolage Grotesque, Segoe UI Variable, sans-serif'
    fontSize: '0.90625rem'
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: 'Bricolage Grotesque, Segoe UI Variable, sans-serif'
    fontSize: '0.75rem'
    fontWeight: 650
    lineHeight: 1.4
rounded:
  control-sm: '8px'
  control: '10px'
  surface: '16px'
  empty-state: '18px'
  action: '999px'
spacing:
  xs: '4px'
  sm: '8px'
  md: '12px'
  lg: '16px'
  xl: '24px'
  2xl: '32px'
  3xl: '40px'
  4xl: '48px'
  page-gutter: '24px'
  section-min: '90px'
components:
  button-primary:
    backgroundColor: '{colors.brand-red}'
    textColor: '{colors.brand-black}'
    rounded: '{rounded.action}'
    padding: '0 21px'
    height: '44px'
  button-secondary:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.text-primary}'
    rounded: '{rounded.action}'
    padding: '0 21px'
    height: '44px'
  button-destructive:
    backgroundColor: '{colors.danger-text}'
    textColor: '{colors.brand-white}'
    rounded: '{rounded.action}'
    padding: '0 21px'
    height: '44px'
---

# Design System: Block Pill

## Overview

**Creative North Star: "A Interrupção Consciente"**

A landing transforma a pausa no próprio material visual. Linhas horizontais representam fluxo; a barra diagonal vermelha interrompe esse movimento; círculos concêntricos representam a decisão recuperada. A composição é clara, assimétrica e espaçosa, com o vermelho reservado para ações e pontos de interrupção.

**Key Characteristics:**

- Branco, preto e o vermelho exato do ícone como único acento cromático.
- Tons quentes e cores de feedback são funcionais, nunca novos acentos de marca.
- Tipografia grande e direta, sem linguagem punitiva.
- Divisórias e espaço negativo no lugar de coleções de cards.
- Movimento concentrado na demonstração do mecanismo.

## Colors

A paleta de marca contém vermelho, preto e branco. A interface acrescenta apenas
neutros confortáveis e cores funcionais de erro, sucesso e aviso. Essas cores não
se tornam acentos de marca e não devem aparecer como decoração.

**The Interruption Rule.** Use o vermelho para barreiras, ações principais e estados significativos, nunca como decoração ambiente.

### Papéis semânticos

- **Canvas confortável** (`#FAF8F5`): reduz a extensão de branco puro em áreas
  grandes; painéis e campos permanecem brancos.
- **Texto principal** (`#171717`): conteúdo e títulos sobre superfícies claras.
- **Texto secundário** (`#3D3D3D`): explicações que ainda precisam de alta
  legibilidade.
- **Texto discreto** (`#525252`): metadados e rótulos pequenos sem recorrer a
  cinzas de baixo contraste.
- **Borda de controle** (`#8C8C8C`): identifica campos e controles contra branco
  ou canvas quente com contraste mínimo de `3:1`.
- **Ação** (`#FF2C2C` com texto `#000000`): nunca usar texto branco normal sobre
  o vermelho da marca.
- **Erro** (`#9D1C20` sobre `#FFF0F0`), **sucesso** (`#075C25` sobre
  `#E7F8EC`) e **aviso** (`#6A4100` sobre `#FFF2CE`): sempre acompanhados de
  texto, ícone, borda ou forma; cor não comunica estado sozinha.

**The Contrast Rule.** WCAG 2.2 AA é obrigatório: `4.5:1` para texto normal e
`3:1` para texto grande, controles e indicadores significativos. `7:1` é uma
preferência para textos quando alcançada sem alterar a identidade ou aumentar a
complexidade.

**The Focus Rule.** Use indicador sólido de 3px: preto em superfícies claras e
branco em superfícies escuras, com afastamento suficiente para não se confundir
com a borda do controle.

## Typography

Display, corpo e interface usam a mesma pilha sans-serif. Títulos são densos e
grandes; corpo permanece arejado, com medida máxima aproximada de 61 caracteres.
Na extensão, texto essencial não fica abaixo de 12px, parágrafos usam entre 14px
e 16px e line-height entre `1.5` e `1.6`. Tamanhos devem ser expressos em `rem`
para acompanhar zoom e preferências do navegador.

**The Direct Voice Rule.** Não use eyebrows sobre títulos nem texto em gradiente. A mensagem principal deve sustentar a hierarquia sozinha.

## Layout

O conteúdo vive em um contêiner de até 1240px. Hero, princípios, roadmap e
chamada final usam grades assimétricas de duas colunas; abaixo de 820px tornam-se
uma coluna. Seções usam grandes intervalos verticais, entre 90px e 160px. No
celular, o gutter é 16px por lado. A extensão deve preservar conteúdo e função em
320px e com zoom de 200%; controles de ação usam alvo preferencial de 44px.

## Elevation & Depth

O sistema é plano. Profundidade vem de contraste tonal, linhas e sobreposição geométrica. Sombras aparecem apenas na barreira vermelha da demonstração para marcar impacto.

## Shapes

Superfícies editoriais são retas. O contêiner escuro de features usa raio suave de 16px; botões são pílulas; círculos concêntricos pertencem exclusivamente ao conceito de pausa e escolha.

## Components

### Buttons

- Primário: pílula `#FF2C2C` com texto preto e altura mínima de 44px; na landing, a ação principal usa 50px. Essa combinação preserva contraste para texto de ação.
- Claro: pílula branca sobre a chamada final vermelha.
- Destrutivo: `#9D1C20` com texto branco, reservado a consequências destrutivas.
- Hover na landing: deslocamento vertical de -2px; active retorna 1px para baixo.
- Hover na extensão: somente cor ou borda, sem deslocar o controle.
- Focus: contorno preto de 3px em fundo claro e branco em fundo escuro.

### Navigation

Marca à esquerda e links compactos à direita. Em telas estreitas, links de seção somem e o acesso ao GitHub permanece.

### Signature Component

A demonstração de pausa combina linha de percurso, ponto em movimento, barreira diagonal e círculo de escolha. É a única animação contínua e deve respeitar `prefers-reduced-motion`.

## Do's and Don'ts

### Do:

- **Do** preserve o vermelho como único acento.
- **Do** diferencie recursos disponíveis de ideias em exploração.
- **Do** mantenha foco visível, contraste AA e redução de movimento.
- **Do** consuma papéis semânticos nos componentes em vez de repetir cores brutas.
- **Do** use `variant` para diferenças visuais de componentes.

### Don't:

- **Don't** transformar a landing em uma grade de cards SaaS.
- **Don't** inventar métricas, depoimentos ou funcionalidades.
- **Don't** aplicar círculos, pílulas ou vermelho sem significado funcional.
- **Don't** usar vermelho da marca como texto pequeno ou branco como texto normal
  sobre o vermelho da marca.
- **Don't** usar cor como único indicador de erro, sucesso, aviso ou seleção.

## Canonical Brand Tokens

- `--brand-red: #FF2C2C` — interrupção, ação e estados significativos.
- `--brand-black: #000000` — estrutura, texto e superfícies de alto contraste.
- `--brand-white: #FFFFFF` — canvas, respiro e conteúdo inverso.
- Tokens da marca são traduzidos em papéis semânticos antes de chegar aos
  componentes. Cores de feedback são funcionais e não ampliam a paleta de marca.
- A fonte de código é `shared/brand/tokens.css`.

## Palette Experiment

A aplicação da paleta na landing está isolada em `apps/web/src/icon-palette-experiment.css`. Ela é carregada depois dos estilos estáveis e não altera a extensão.

Para reverter o teste, remova apenas o import de `./icon-palette-experiment.css` em `apps/web/src/index.tsx`. A landing anterior volta sem desfazer componentes, movimento ou layout.
