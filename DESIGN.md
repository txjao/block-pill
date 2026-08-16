---
name: Block Pill
description: Fricção consciente para uma navegação com mais intenção.
colors:
  interruption-red: "#e92d32"
  action-red: "#bd1f24"
  ink: "#201e22"
  paper: "#f4f1ed"
  muted: "#69636a"
  line: "#cbc5c2"
typography:
  display:
    fontFamily: "Aptos, Segoe UI Variable, Helvetica Neue, sans-serif"
    fontSize: "clamp(3.55rem, 7vw, 6rem)"
    fontWeight: 770
    lineHeight: 0.95
    letterSpacing: "-0.04em"
  body:
    fontFamily: "Aptos, Segoe UI Variable, Helvetica Neue, sans-serif"
    fontSize: "clamp(1.08rem, 1.6vw, 1.3rem)"
    lineHeight: 1.55
rounded:
  surface: "16px"
  action: "999px"
spacing:
  page-gutter: "24px"
  section-min: "90px"
components:
  button-primary:
    backgroundColor: "{colors.action-red}"
    textColor: "#ffffff"
    rounded: "{rounded.action}"
    padding: "0 21px"
    height: "50px"
---

# Design System: Block Pill

## Overview

**Creative North Star: "A Interrupção Consciente"**

A landing transforma a pausa no próprio material visual. Linhas horizontais representam fluxo; a barra diagonal vermelha interrompe esse movimento; círculos concêntricos representam a decisão recuperada. A composição é clara, assimétrica e espaçosa, com o vermelho reservado para ações e pontos de interrupção.

**Key Characteristics:**

- Papel frio, tinta grafite e um único acento vermelho.
- Tipografia grande e direta, sem linguagem punitiva.
- Divisórias e espaço negativo no lugar de coleções de cards.
- Movimento concentrado na demonstração do mecanismo.

## Colors

O vermelho Block Pill é raro e funcional; os neutros carregam quase toda a superfície.

**The Interruption Rule.** Use o vermelho para barreiras, ações principais e estados significativos, nunca como decoração ambiente.

## Typography

Display e corpo usam a mesma pilha sans-serif. Títulos são densos e grandes; corpo permanece arejado, com medida máxima aproximada de 61 caracteres.

**The Direct Voice Rule.** Não use eyebrows sobre títulos nem texto em gradiente. A mensagem principal deve sustentar a hierarquia sozinha.

## Layout

O conteúdo vive em um contêiner de até 1240px. Hero, princípios, roadmap e chamada final usam grades assimétricas de duas colunas; abaixo de 820px tornam-se uma coluna. Seções usam grandes intervalos verticais, entre 90px e 160px. No celular, o gutter é 16px por lado.

## Elevation & Depth

O sistema é plano. Profundidade vem de contraste tonal, linhas e sobreposição geométrica. Sombras aparecem apenas na barreira vermelha da demonstração para marcar impacto.

## Shapes

Superfícies editoriais são retas. O contêiner escuro de features usa raio suave de 16px; botões são pílulas; círculos concêntricos pertencem exclusivamente ao conceito de pausa e escolha.

## Components

### Buttons

- Primário: pílula vermelho-escura com texto branco e altura mínima de 50px.
- Claro: pílula branca sobre a chamada final vermelha.
- Hover: deslocamento vertical de -2px; active retorna 1px para baixo.
- Focus: contorno vermelho de 3px com afastamento de 4px.

### Navigation

Marca à esquerda e links compactos à direita. Em telas estreitas, links de seção somem e o acesso ao GitHub permanece.

### Signature Component

A demonstração de pausa combina linha de percurso, ponto em movimento, barreira diagonal e círculo de escolha. É a única animação contínua e deve respeitar `prefers-reduced-motion`.

## Do's and Don'ts

### Do:

- **Do** preserve o vermelho como único acento.
- **Do** diferencie recursos disponíveis de ideias em exploração.
- **Do** mantenha foco visível, contraste AA e redução de movimento.

### Don't:

- **Don't** transformar a landing em uma grade de cards SaaS.
- **Don't** inventar métricas, depoimentos ou funcionalidades.
- **Don't** aplicar círculos, pílulas ou vermelho sem significado funcional.
