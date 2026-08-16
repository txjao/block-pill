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

Os domínios bloqueados são armazenados em `chrome.storage.local`. Eles não são
enviados ou sincronizados com serviços externos e são apagados quando a extensão
é desinstalada.

## Permissões atuais

- `storage`: persiste a lista de domínios no dispositivo.
- `declarativeNetRequest`: permite ao navegador aplicar regras declarativas sem
  entregar à extensão o conteúdo das requisições.
- Acesso a páginas HTTP e HTTPS: permite redirecionar domínios escolhidos pelo
  usuário para a página local de bloqueio.

A extensão não usa `tabs`, `webNavigation` ou content scripts para realizar o
bloqueio padrão.
