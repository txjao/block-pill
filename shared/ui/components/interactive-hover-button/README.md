# InteractiveHoverButton

Componente compartilhado pelos adaptadores React e Preact. O padrão continua
sendo `outline`, com seta ao final e largura ajustada ao conteúdo.

```tsx
<InteractiveHoverButton
  text="Salvar reflexão"
  variant="outline"
  size="default"
  icon={<CheckIcon />}
  iconPosition="end"
  colors={{ hoverBackground: '#b63838', hoverForeground: '#fff' }}
  loading={saving}
  onClick={save}
/>
```

- `variant`: `outline`, `primary`, `bright`, `inverse` ou `dark`.
- `size`: `default` ou `compact`.
- `fluid`: ocupa a largura disponível, incluindo o wrapper.
- `icon`: elemento do framework; omitido usa seta, `null` remove o ícone.
- `iconPosition`: `start` ou `end`.
- `colors`: `background`, `foreground`, `hoverBackground`, `hoverForeground`,
  `border`. As cores são aplicadas como propriedades CSS locais.
- `href`, `target`, `rel`: renderizam um link; links desabilitados ou carregando
  não navegam. Botões nativos recebem `disabled` e `aria-busy`.

A variante `bright` usa vermelho vivo com texto preto e inverte no hover. A
variante `inverse` começa preta com texto vermelho e faz a inversão oposta. As
duas variantes compartilham os mesmos tokens com o componente `Button`. Ao
personalizar cores, verifique o contraste tanto em repouso quanto no hover. As
transições atingem somente `transform`, `opacity` e `clip-path`; o tamanho do
preenchimento permanece fixo. O componente respeita movimento reduzido e mantém
o rótulo visível em dispositivos sem hover.
