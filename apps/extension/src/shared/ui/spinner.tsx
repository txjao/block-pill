export function Spinner({ label = 'Carregando' }: { label?: string }) {
  return (
    <span class="spinner" role="status">
      <span aria-hidden="true" />
      <span class="sr-only">{label}</span>
    </span>
  );
}
