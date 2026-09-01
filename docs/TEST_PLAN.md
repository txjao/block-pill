# Plano de testes

## Objetivo

Validar as regras de domínio, persistência local, regras declarativas, alarmes,
abas, modo anônimo, interfaces e privacidade do Block Pill antes da publicação.

## Estratégia adotada para o refactor visual

O refactor visual será implementado antes da criação dos novos testes de
interface. Os testes automatizados já existentes continuam obrigatórios durante
todo o trabalho e não podem regredir.

A sequência para a nova interface é:

1. concluir a implementação visual e a integração com os Models;
2. levantar as regras específicas acrescentadas pelo Block Pill;
3. discutir cada regra, incluindo entradas, saída esperada, erros e casos
   extremos;
4. aprovar o comportamento que será considerado correto;
5. criar os testes unitários das regras aprovadas;
6. validar os fluxos completos e executar os testes manuais relevantes.

### Responsabilidade dos testes

Componentes de terceiros são escolhidos para encapsular comportamentos
complexos, como gerenciamento de foco, navegação por teclado, portais e
atributos ARIA. O Block Pill não reproduz os testes internos mantidos pela
biblioteca.

Os testes do projeto cobrem:

- regras implementadas pelos Models, casos de uso e componentes do Block Pill;
- dados enviados a um componente de terceiros e respostas tratadas pelo projeto;
- habilitação, cancelamento, confirmação, erro e carregamento dos fluxos;
- integrações entre Page, Model, View e mensagens da extensão;
- contratos de acessibilidade que dependem da composição feita pelo Block Pill.
- contratos de mensagens, incluindo discriminador, payload, normalização e
  rejeição de valores que violam regras do domínio;
- compatibilidade de schemas de persistência com dados antigos e seus valores
  padrão.

Um componente compartilhado puramente visual não exige teste unitário próprio.
Ele passa a exigir teste quando acrescenta estado, transformação de dados,
decisão ou outra regra pertencente ao projeto.

### Registro de cada regra

Antes de criar um novo teste de interface, a regra será detalhada com o seguinte
formato:

| Campo                    | Descrição                                       |
| ------------------------ | ----------------------------------------------- |
| Regra                    | Comportamento específico do Block Pill          |
| Entrada e estado inicial | Dados, permissões e estado necessários          |
| Resultado esperado       | Saída, mensagem ou mudança de estado observável |
| Erros e limites          | Falhas, valores extremos e ações indisponíveis  |
| Nível de teste           | Unitário, integração de fluxo ou manual         |

As ferramentas adicionais para testes de DOM serão decididas somente depois do
levantamento dessas regras. Vitest permanece como executor dos testes existentes.

## Ambientes

- Node.js 20.19 ou superior e pnpm 11.
- Chrome estável e Chrome Beta, em perfis descartáveis separados.
- Extensão carregada sem compactação a partir de `apps/extension/dist`.
- Uma janela normal e, quando autorizado, uma janela anônima.

## Preparação

1. Execute `pnpm install`.
2. Execute `pnpm --filter @block-pill/extension test`.
3. Execute `pnpm --filter @block-pill/extension build`.
4. Abra `chrome://extensions`, ative o modo de desenvolvedor e carregue
   `apps/extension/dist`.
5. Abra o service worker pelo painel da extensão e mantenha o console disponível.
6. Use domínios descartáveis ou conhecidos; não registre relatos reais durante
   testes compartilhados.

## Testes automatizados

### Domínio

- Normalização de URL, `www`, caixa e caminho.
- Rejeição de protocolos e hostnames inválidos.
- Orçamento padrão: `5 + 5 + 5`, `5 + 5 + 1 + 1 + 1` e liberação direta de 15.
- Consumo do tempo concedido mesmo sem uso.
- Persistência indefinida do saldo parcial.
- Cooldown padrão, customizado, mínimo, máximo e fracionário.
- Reset somente após o fim do cooldown.
- Independência entre domínios.
- Exceções válidas e inválidas de subdomínio.
- Bloqueio permanente sem operação de remoção.
- Conversão e limites de dias, meses e anos nos modos anti.
- Ativação simultânea, importação de perfil e desativação protegida.
- Liberação anti apenas em domínios de gatilho.
- Sanitização de caminho e limite do histórico local.

### Infraestrutura

- Intervalos de IDs não sobrepostos.
- Prioridades DNR: anti `3`, permanente `2`, padrão `1`.
- Bloqueio de subdomínios e exceções apenas no padrão.
- URLs de redirecionamento contêm modo e hostname.
- Regras de gatilho somem durante uma liberação anti.
- Schemas descartam registros inválidos e migram registros legados.
- Rollback do repository quando a atualização DNR falha.

## Testes manuais

### Bloqueio padrão

1. Adicione `youtube.com` e confirme o redirecionamento de `youtube.com` e
   `m.youtube.com`.
2. Libere cinco minutos e confirme que todas as abas do domínio ficam acessíveis.
3. Feche a aba sem usar o período inteiro e confirme que cinco minutos foram
   consumidos.
4. Ao expirar, confirme que todas as abas do domínio em janelas normais são
   redirecionadas imediatamente.
5. Repita até totalizar 15 minutos e confirme a mensagem de cooldown.
6. Reinicie o Chrome durante uma liberação e confirme que o alarme é reconstruído.
7. Defina cooldown global de `1.5` hora e confirme a persistência após reinício.
8. Defina cooldown específico para o domínio e confirme que não altera um
   cooldown já iniciado.
9. Libere `music.youtube.com` como exceção e confirme que o domínio principal
   continua bloqueado.
10. Confirme que outro domínio mantém orçamento e cooldown independentes.

### Bloqueio permanente

1. Inicie com um domínio no bloqueio padrão e converta-o em permanente.
2. Confirme o modal de aviso e a informação sobre subdomínios/desinstalação.
3. Verifique que a regra padrão e seu estado foram removidos.
4. Confirme que não existe botão, mensagem ou API de remoção na interface.
5. Confirme que a página permanente se sobrepõe à página padrão.
6. Simule falha DNR pelo DevTools e confirme que o domínio padrão é restaurado.

### Modos anti

1. Sem autorização anônima, tente ativar cada modo e confirme o bloqueio da ação.
2. Conceda a autorização em `chrome://extensions` e ative um compromisso de um dia.
3. Ative os dois modos simultaneamente e confirme dados independentes.
4. Ative o segundo modo importando objetivos/hobbies e confirme que eventos e
   relatos não foram copiados.
5. Teste duração de 1, 7, 31, 366 e 732 dias.
6. Teste valores customizados em dias, meses e anos, incluindo os limites.
7. Confirme que um domínio explícito não oferece liberação.
8. Confirme que um domínio de gatilho oferece apenas 1, 5 ou 15 minutos e não
   aplica cooldown entre liberações.
9. Ao expirar, confirme redirecionamento de todas as abas e exibição de objetivos
   e hobbies.
10. Adicione um domínio à categoria e confirme bloqueio dos subdomínios.
11. Revogue a autorização anônima e confirme o alerta cuidadoso no popup e nas
    configurações.
12. Durante o prazo, confirme que a suspensão do controle anônimo é recusada.
13. Após o prazo, confirme que o switch continua ativo até a desativação manual.
14. Conclua o modal de atrito e confirme a animação de celebração.

### Navegação anônima

1. Com autorização concedida e proteção ativa, tente abrir uma janela anônima e
   confirme que ela é fechada.
2. Sem compromisso anti, desative e reative livremente a proteção global.
3. Suspenda o controle por 1, 5 e 15 minutos.
4. Confirme que não há cooldown entre suspensões.
5. Após cada prazo, confirme que uma nova janela anônima volta a ser fechada.
6. Revogue a autorização pelo Chrome e confirme que a interface não promete
   controle que tecnicamente não possui.

### Reflexões e recomendações

1. Selecione múltiplos sentimentos e escreva um relato.
2. Recarregue a página e confirme o registro no dashboard.
3. Teste as opções entretenimento, informação e impulso.
4. Confirme que entretenimento sugere atividades fora da tela.
5. Confirme que informação abre uma pesquisa Google com o texto digitado.
6. Confirme que impulso prioriza hobbies cadastrados.
7. Ative conhecimento filosófico e confirme a exibição da frase.

### Dashboard e privacidade

1. Confirme tentativas, liberações, último acesso, última tentativa e data inicial.
2. Confirme relatórios independentes por modo e por domínio.
3. Confirme sentimentos recorrentes e detalhes de cada reflexão.
4. Navegue para uma URL com query e fragmento sensíveis; inspecione
   `chrome.storage.local` e confirme que apenas domínio e caminho foram salvos.
5. Exclua registros por domínio, por modo e em conjunto após marcar a confirmação;
   confirme em todos os casos que os bloqueios permanecem.
6. Desinstale a extensão, reinstale e confirme que nenhum dado anterior reaparece.
7. Monitore a aba Network do service worker e confirme ausência de envio de dados.

### Acessibilidade e interface

1. Percorra popup, configurações, modais e páginas bloqueadas apenas com teclado.
2. Confirme foco visível, ordem lógica, labels e anúncios de erro/status.
3. Teste zoom de 200% e larguras de 320, 768 e 1280 pixels.
4. Ative `prefers-reduced-motion` e confirme que confetes e movimentos cessam.
5. Verifique contraste AA e ausência de overflow horizontal fora das tabelas.

## Critérios de aprovação

- Todos os testes automatizados passam.
- Nenhum erro não tratado aparece no service worker ou nas páginas.
- Alarmes restauram regras após expiração e reinício.
- A ordem anti → permanente → padrão é observada.
- Nenhuma rota de remoção permanente existe dentro da extensão.
- Nenhuma informação além de domínio, caminho e dados preenchidos voluntariamente
  aparece no armazenamento.
- Limitações do modo anônimo são apresentadas com precisão.
