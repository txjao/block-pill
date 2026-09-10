import { Toggle } from '@/shared/ui/components/toggle';
import type { ComponentChildren } from 'preact';
import type { useReflectionsModel } from './reflections.model';
import styles from './styles/reflections.module.css';

type Model = ReturnType<typeof useReflectionsModel>;

export function ReflectionsView({
  enabled,
  loading,
  feedback,
  changeEnabled,
}: Model) {
  return (
    <section class={styles.settings}>
      <h1>Reflexões</h1>
      <p>
        Uma frase para acompanhar sua pausa e ajudar a retomar o que importa
        para você.
      </p>
      <Toggle
        label="Mostrar reflexões nas pausas"
        description="Vale para bloqueios flexíveis, permanentes e modos anti."
        checked={enabled}
        disabled={loading}
        onCheckedChange={(value) => void changeEnabled(value)}
      />
      <p role="status">{feedback}</p>
    </section>
  );
}

export function ReflectionQuoteView({
  enabled,
  loading,
  fallback,
}: Model & { fallback?: ComponentChildren }) {
  if (loading) return null;
  return enabled ? (
    <blockquote class={styles.quote}>
      <p>“Nenhum homem é livre se não for senhor de si mesmo.”</p>
      <cite>Epicteto</cite>
    </blockquote>
  ) : (
    <>{fallback}</>
  );
}
