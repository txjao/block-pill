# Privacidade

Block Pill foi concebida para funcionar localmente e ajudar o usuário sem transformar sua navegação em produto.

## Compromissos

- Não vender dados ou recursos premium.
- Não incluir anúncios, analytics ou telemetria por padrão.
- Não enviar histórico, endereços visitados, títulos de páginas ou pesquisas.
- Não sincronizar configurações ou listas de bloqueio com serviços externos.
- Não baixar nem executar código remoto.
- Solicitar apenas permissões necessárias às funcionalidades implementadas.
- Restringir scripts de conteúdo aos sites em que uma alteração visual seja necessária.

## Armazenamento local

Os domínios bloqueados, configurações, objetivos, hobbies, tentativas, sentimentos
e relatos opcionais são armazenados em `chrome.storage.local`. O histórico guarda
somente domínio e caminho; query strings e fragmentos são descartados. Esses dados
não são enviados ou sincronizados e são apagados quando a extensão é desinstalada.

## Permissões atuais

- `storage`: persiste a lista de domínios no dispositivo.
- `alarms`: encerra liberações temporárias mesmo quando o service worker estiver
  suspenso.
- `tabs`: redireciona todas as abas controláveis quando uma liberação termina.
- `webNavigation`: identifica tentativas e armazena somente domínio e caminho,
  sem conteúdo da página, query string ou fragmento.
- `declarativeNetRequest`: permite ao navegador aplicar regras declarativas sem
  entregar à extensão o conteúdo das requisições.
- Acesso a páginas HTTP e HTTPS: permite redirecionar domínios escolhidos pelo
  usuário para a página local de bloqueio.

O acesso ao modo anônimo não pode ser concedido automaticamente. Quando o usuário
o habilita na página do Chrome, a extensão consegue fechar janelas anônimas durante
um compromisso anti. Revogar essa permissão remove tecnicamente esse controle, e a
interface passa a exibir um alerta.
