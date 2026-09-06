import { createElement, type JSX } from 'preact';
import {
  createInteractiveHoverButton,
  type InteractiveHoverButtonProps,
} from '@workspace/shared/ui/components/interactive-hover-button';

export function InteractiveHoverButton(props: InteractiveHoverButtonProps): JSX.Element {
  return createInteractiveHoverButton(createElement as never, props) as JSX.Element;
}

export type { InteractiveHoverButtonProps };
