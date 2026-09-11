export const repo = 'https://github.com/txjao/block-pill';
export const capabilities = [
  {
    value: 'local',
    title: 'Local por princípio',
    text: 'Sua lista de bloqueios permanece no navegador. Nenhum histórico precisa sair da sua máquina.',
  },
  {
    value: 'persistent',
    title: 'Bloqueio que persiste',
    text: 'As regras continuam ativas entre sessões usando recursos nativos do Chrome.',
  },
  {
    value: 'legible',
    title: 'Controle legível',
    text: 'Adicionar e remover domínios é simples, e cada permissão tem uma razão clara.',
  },
] as const;
export const storySteps = [
  ['Você escolhe', 'Cadastre os domínios onde deseja criar uma interrupção.'],
  [
    'O endereço é simplificado',
    'A extensão normaliza o endereço para aplicar a regra ao domínio correto.',
  ],
  [
    'A escolha fica local',
    'Sua lista permanece armazenada no próprio navegador.',
  ],
  [
    'A regra persiste',
    'O Chrome mantém o redirecionamento ativo entre sessões.',
  ],
  [
    'O automático para',
    'No próximo acesso, o impulso encontra a pausa que você definiu.',
  ],
  [
    'O controle continua seu',
    'Quando quiser, você pode remover o domínio e desfazer a regra.',
  ],
] as const;
export const ideas = [
  ['Pausas temporárias', 'Desbloqueios conscientes, com tempo e contexto.'],
  [
    'Novas formas de fricção',
    'Intervenções graduais sem transformar foco em punição.',
  ],
  [
    'Mais navegadores',
    'Compatibilidade sem comprometer privacidade ou simplicidade.',
  ],
] as const;
