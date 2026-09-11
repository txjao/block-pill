import type { ComponentChildren, JSX } from 'preact';
import { HoverUnderline } from '@/shared/ui/components/hover-underline';
import styles from './text-link.module.css';

interface TextLinkProps extends Omit<
  JSX.AnchorHTMLAttributes<HTMLAnchorElement>,
  'className'
> {
  children: ComponentChildren;
  className?: string;
}

export function TextLink({
  children,
  className,
  ...anchorProps
}: TextLinkProps) {
  return (
    <a
      {...anchorProps}
      class={className ? `${styles.textLink} ${className}` : styles.textLink}
    >
      <HoverUnderline>{children}</HoverUnderline>
    </a>
  );
}
