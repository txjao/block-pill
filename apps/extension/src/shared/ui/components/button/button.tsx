import type { ComponentChildren, JSX } from 'preact';
import styles from './button.module.css';

export type ButtonVariant =
  'primary' | 'secondary' | 'dark' | 'destructive' | 'text';
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
    .filter(
      (value): value is string => typeof value === 'string' && value.length > 0,
    )
    .join(' ');

  return (
    <button
      {...buttonProps}
      class={classes}
      disabled={loading ? true : disabled}
      aria-busy={loading ? true : undefined}
    >
      {loading ? 'Aguarde…' : children}
    </button>
  );
}
