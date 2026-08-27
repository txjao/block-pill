import type { ComponentChildren } from 'preact';

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ComponentChildren;
  tone?: 'neutral' | 'accent' | 'positive' | 'warning';
}) {
  return <span class={`badge badge--${tone}`}>{children}</span>;
}
