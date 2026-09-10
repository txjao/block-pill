# Catálogo de sites estimulantes

`stimulating-sites.json` é a fonte versionada usada pelo popup da extensão.
Contribuições devem adicionar somente o domínio principal, em letras minúsculas,
sem protocolo, caminho ou `www`.

Os testes automatizados rejeitam domínios inválidos e entradas duplicadas depois
da normalização. Nesta versão, o catálogo é empacotado com a extensão para
funcionar offline. Uma release futura poderá sincronizar o mesmo formato a partir
do GitHub, com cache e fallback para a cópia local.
