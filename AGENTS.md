# Fluxo obrigatório para alterações

## Antes da implementação

1. Inspecionar o comportamento e o código existentes.
2. Explicar o fluxo atual de ponta a ponta.
3. Apresentar o novo fluxo percebido pelo usuário.
4. Explicar o fluxo técnico entre arquivos, módulos e APIs.
5. Mostrar os principais trechos de código propostos e explicar:
   - o que cada função faz;
   - suas entradas e saídas;
   - como os erros são tratados;
   - por que a solução foi escolhida.
6. Listar os arquivos que serão alterados e o motivo de cada alteração.
7. Aguardar aprovação explícita antes de editar arquivos.

Inspeções e verificações somente leitura podem ser executadas antes da
aprovação.

## Depois da implementação

1. Resumir o que realmente foi alterado.
2. Explicar novamente o fluxo de ponta a ponta, agora com o código efetivo.
3. Explicar os trechos relevantes implementados, incluindo:
   - a responsabilidade de cada função;
   - entradas e saídas;
   - chamadas a APIs externas;
   - tratamento de erros.
4. Informar testes, build e demais verificações executadas.
5. Informar limitações, diferenças em relação à proposta e próximos passos.

Não considerar uma alteração concluída apenas porque o código compila: o
comportamento resultante também deve ser explicado ao usuário.
