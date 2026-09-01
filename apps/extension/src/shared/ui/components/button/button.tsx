import type { ComponentChildren, JSX } from 'preact';
import styles from './button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'dark' | 'destructive' | 'text';
export type ButtonSize = 'compact' | 'default';

export interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ComponentChildren;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fluid?: boolean;
  loading?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'default',
  fluid = false,
  loading = false,
  className,
  disabled,
  ...buttonProps
}: ButtonProps) {
  const classes = [
    styles.button,
    styles[variant],
    styles[size],
    fluid ? styles.fluid : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      {...buttonProps}
      class={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
    >
      {loading ? 'Aguarde…' : children}
    </button>
  );
}
