import './interactive-hover-button.css';

export interface InteractiveHoverButtonProps {
  variant?: 'outline' | 'primary' | 'bright' | 'inverse' | 'dark';
  size?: 'compact' | 'default';
  fluid?: boolean;
  icon?: unknown;
  iconPosition?: 'start' | 'end';
  colors?: {
    background?: string;
    foreground?: string;
    hoverBackground?: string;
    hoverForeground?: string;
    border?: string;
  };
  text?: string;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  loading?: boolean;
  href?: string;
  target?: string;
  rel?: string;
  ariaLabel?: string;
  onClick?: () => void;
}

type ElementFactory = (
  type: string,
  props: Record<string, unknown> | null,
  ...children: unknown[]
) => unknown;

export function createInteractiveHoverButton(
  h: ElementFactory,
  {
    text = 'Button',
    className = '',
    type = 'button',
    disabled = false,
    loading = false,
    href,
    target,
    rel,
    ariaLabel,
    onClick,
    variant = 'outline',
    size = 'default',
    fluid = false,
    icon,
    iconPosition = 'end',
    colors,
  }: InteractiveHoverButtonProps,
) {
  const label = loading ? 'Aguarde…' : text;
  const controlClassName =
    `interactive-hover-button interactive-hover-button--${variant} interactive-hover-button--${size} ${className}`.trim();
  const busy = disabled || loading;
  const style = {
    ...(colors?.background && {
      '--interactive-button-background': colors.background,
    }),
    ...(colors?.foreground && {
      '--interactive-button-foreground': colors.foreground,
    }),
    ...(colors?.hoverBackground && {
      '--interactive-button-primary': colors.hoverBackground,
    }),
    ...(colors?.hoverForeground && {
      '--interactive-button-hover-foreground': colors.hoverForeground,
    }),
    ...(colors?.border && { '--interactive-button-border': colors.border }),
  };

  const arrow = h(
    'svg',
    {
      xmlns: 'http://www.w3.org/2000/svg',
      width: 24,
      height: 24,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 2,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      className: 'interactive-hover-button__arrow',
      'aria-hidden': 'true',
    },
    h('path', { d: 'M5 12h14' }),
    h('path', { d: 'm12 5 7 7-7 7' }),
  );

  const children = [
    h('span', { className: 'interactive-hover-button__label' }, label),
    h(
      'div',
      {
        className: 'interactive-hover-button__reveal',
        'aria-hidden': 'true',
      },
      h('span', null, label),
      iconPosition === 'start' && icon !== null
        ? h(
            'span',
            {
              className:
                'interactive-hover-button__icon interactive-hover-button__icon--start',
            },
            icon ?? arrow,
          )
        : null,
      iconPosition === 'end' && icon !== null
        ? h(
            'span',
            { className: 'interactive-hover-button__icon' },
            icon ?? arrow,
          )
        : null,
    ),
    h('div', {
      className: 'interactive-hover-button__fill',
      'aria-hidden': 'true',
    }),
  ];

  const control = href
    ? h(
        'a',
        {
          className: controlClassName,
          href: busy ? undefined : href,
          target,
          rel: rel ?? (target === '_blank' ? 'noopener noreferrer' : undefined),
          'aria-label': ariaLabel,
          style,
          'aria-disabled': busy || undefined,
          'aria-busy': loading || undefined,
          role: busy ? 'link' : undefined,
          tabIndex: busy ? -1 : undefined,
          onClick: busy ? undefined : onClick,
        },
        ...children,
      )
    : h(
        'button',
        {
          className: controlClassName,
          style,
          type,
          disabled: disabled || loading,
          'aria-label': ariaLabel,
          'aria-busy': loading || undefined,
          onClick: busy ? undefined : onClick,
        },
        ...children,
      );

  return h(
    'div',
    {
      className: `interactive-hover-button-wrapper${fluid ? ' interactive-hover-button-wrapper--fluid' : ''}`,
    },
    control,
  );
}
