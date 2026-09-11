import type { ComponentChildren } from 'preact';
import styles from './hover-underline.module.css';

interface HoverUnderlineProps {
  children: ComponentChildren;
  className?: string;
}

export function HoverUnderline({ children, className }: HoverUnderlineProps) {
  return (
    <span
      class={
        className
          ? `${styles.hoverUnderline} ${className}`
          : styles.hoverUnderline
      }
    >
      {children}
    </span>
  );
}
