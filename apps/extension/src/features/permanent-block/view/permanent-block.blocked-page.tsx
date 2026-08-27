import { Brand } from '../../../shared/ui/brand';

export function PermanentBlockBlockedPage() {
  const hostname = new URLSearchParams(window.location.search).get('hostname');

  return (
    <main>
      <Brand title="Bloqueio permanente" />
      <section class="interruption permanent-interruption">
        <h1>Você já tomou esta decisão.</h1>
        <p>
          {hostname ? <strong>{hostname}</strong> : 'Este site'} continuará bloqueado. A extensão
          não oferece liberação temporária nem exceções para esta regra.
        </p>
        <p class="support-copy">
          O objetivo é criar espaço entre o impulso e a ação. Volte ao que você escolheu proteger
          quando criou este bloqueio.
        </p>
      </section>
    </main>
  );
}
