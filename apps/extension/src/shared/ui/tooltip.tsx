import type { ComponentChildren } from 'preact';
import { useId } from 'preact/hooks';

interface TooltipProps {
  children: ComponentChildren;
  text: ComponentChildren;
  position?: 'top' | 'bottom';
}

export function Tooltip({ children, text, position = 'top' }: TooltipProps) {
  const id = useId();
  return (
    <span class="tooltip">
      <span class="tooltip__anchor" tabIndex={0} aria-describedby={id}>
        {children}
      </span>
      <span class={`tooltip__content tooltip__content--${position}`} id={id} role="tooltip">
        {text}
      </span>
    </span>
  );
}
