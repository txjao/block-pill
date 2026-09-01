import type { ComponentChildren } from 'preact';
import styles from './tooltip.module.css';

export function Tooltip({
  children,
  content,
  side = 'top',
}: {
  children: ComponentChildren;
  content: ComponentChildren;
  side?: 'top' | 'bottom';
}) {
  return (
    <span class={styles.root}>
      {children}
      <span class={`${styles.content} ${styles[side]}`} role="tooltip">
        {content}
      </span>
    </span>
  );
}
