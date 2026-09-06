import type { ComponentChildren } from 'preact';
import styles from './badge.module.css';

export type BadgeVariant =
  'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'outline';

export function Badge({
  children,
  variant = 'neutral',
}: {
  children: ComponentChildren;
  variant?: BadgeVariant;
}) {
  return <span class={`${styles.badge} ${styles[variant]}`}>{children}</span>;
}
