# Regras de bloqueio

Este documento registra as decisões implementadas para os bloqueios padrão,
permanente, anti-pornografia e anti-aposta.

## Bloqueio padrão

O bloqueio padrão não expira sozinho. Ele bloqueia um domínio e seus
subdomínios, mas oferece liberações temporárias para evitar o uso prolongado.

### Orçamento de acesso

- Cada domínio possui um orçamento independente de 15 minutos.
- As liberações disponíveis são de 1, 5 ou 15 minutos.
- O tempo é consumido no momento da concessão, mesmo que o usuário feche a aba
  antes ou não use o período inteiro.
- As liberações são cumulativas. Exemplo: `5 + 5 + 5 = 15`.
- Enquanto houver saldo e nenhuma liberação estiver ativa, uma nova liberação
  pode começar imediatamente.
- Um botão só fica habilitado quando sua duração cabe no saldo. Se restarem dois
  minutos, somente a opção de um minuto pode ser usada, duas vezes.
- Consumir apenas parte do orçamento não inicia cooldown nem repõe o saldo.

O texto da interface deve deixar explícito que o limite é cumulativo e pode usar
o lema: “Todo mundo merece 15 minutinhos de descanso!”. Antes da liberação, a
interface também deve avisar que, após consumir os 15 minutos, será necessário
aguardar o cooldown.

### Cooldown

- O cooldown começa quando termina a liberação que consumiu o saldo total.
- Durante o cooldown não há nova liberação.
- Ao terminar o cooldown, o próximo acesso calcula um novo orçamento de 15
  minutos. Não existe evento periódico ou reset por meia-noite.
- O padrão global é uma hora.
- Presets: 1, 2, 4, 6, 12 e 24 horas.
- O valor customizado aceita frações, com mínimo de uma hora e máximo de 732
  dias (dois anos).
- Um domínio pode sobrescrever o padrão global.
- Alterações de configuração não encurtam um cooldown já iniciado.

Ao expirar uma liberação, um alarme restaura a regra e todas as abas controláveis
daquele domínio voltam à página de bloqueio.

### Correspondência de domínio

- Bloquear `example.com` bloqueia seus subdomínios por padrão.
- Exceções de subdomínio são permitidas apenas no bloqueio padrão.
- Domínios têm orçamento e cooldown independentes.
- Grupos que compartilham orçamento ficam planejados para a versão 1.1.

### Exceções de subdomínio

Uma exceção só aparece quando o usuário tenta abrir um subdomínio herdado de
uma regra padrão. Ela não fica disponível na lista geral de configurações.

Por exemplo, ao bloquear `example.com`, uma visita a `music.example.com`
explica que o endereço foi incluído pela regra principal e permite liberar
somente esse subdomínio. O domínio principal e os demais subdomínios continuam
bloqueados.

## Bloqueio permanente

O bloqueio permanente cria atrito deliberado para conteúdos que o usuário não
quer liberar por impulso.

- Bloqueia o domínio e todos os seus subdomínios.
- Não oferece acesso temporário, exceção de subdomínio, remoção ou desbloqueio
  pela extensão.
- A confirmação deve explicar com clareza que somente desinstalar a extensão
  desfaz o bloqueio; não é necessário redigitar o domínio.
- A desinstalação remove os dados locais: o objetivo é atrito, não prisão.
- Converter um bloqueio padrão em permanente remove a regra padrão e seu estado
  de saldo/cooldown antes de criar a regra permanente.
- Bloqueios permanentes usam um intervalo de IDs de regras separado do bloqueio
  padrão.

O serviço e a interface permanente não expõem operação de remoção.

## Modos anti

- Anti-pornografia e anti-aposta podem permanecer ativos simultaneamente.
- Cada modo possui domínios explícitos, domínios de gatilho e domínios adicionais
  definidos pelo usuário.
- Domínios explícitos não oferecem liberação. Domínios de gatilho oferecem 1, 5
  ou 15 minutos sem cooldown.
- Compromissos temporários aceitam dias, meses e anos, usando conversões fixas de
  31 dias por mês e 366 dias por ano, entre 1 e 732 dias.
- O compromisso padrão é de 31 dias; o permanente só termina com a desinstalação.
- Modos temporários permanecem visualmente ativos após o prazo e são desativados
  manualmente por um fluxo de atrito e reconhecimento da conquista.
- Objetivos e hobbies são opcionais. Podem ser importados do outro modo sem
  importar tentativas, sentimentos ou relatos.
- A ativação exige que o usuário conceda acesso anônimo na página do Chrome.
- Durante o prazo de um compromisso anti, o controle anônimo não pode ser
  suspenso. Fora dele, pode ser suspenso por 1, 5 ou 15 minutos sem cooldown.
- Relatos e sentimentos ficam locais e podem ser excluídos manualmente sem
  remover o bloqueio.

## Prioridade entre telas

Quando mais de uma regra corresponder ao mesmo domínio, a tela percebida pelo
usuário respeitará esta prioridade:

```text
modo anti -> bloqueio permanente -> bloqueio padrão
```

As regras DNR usam prioridades distintas para garantir essa ordem.
