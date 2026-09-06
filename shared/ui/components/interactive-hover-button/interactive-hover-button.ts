import './interactive-hover-button.css';

export interface InteractiveHoverButtonProps {
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
  }: InteractiveHoverButtonProps,
) {
  const label = loading ? 'Aguarde…' : text;
  const controlClassName = `interactive-hover-button ${className}`.trim();

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
      arrow,
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
          href,
          target,
          rel,
          'aria-label': ariaLabel,
        },
        ...children,
      )
    : h(
        'button',
        {
          className: controlClassName,
          type,
          disabled: disabled || loading,
          'aria-label': ariaLabel,
          'aria-busy': loading || undefined,
          onClick,
        },
        ...children,
      );

  return h('div', { className: 'interactive-hover-button-wrapper' }, control);
}
