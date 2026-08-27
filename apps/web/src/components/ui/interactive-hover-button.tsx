import { createElement, type ReactElement } from 'react';
import {
  createInteractiveHoverButton,
  type InteractiveHoverButtonProps,
} from '../../../../../shared/ui/interactive-hover-button';

export function InteractiveHoverButton(props: InteractiveHoverButtonProps): ReactElement {
  return createInteractiveHoverButton(createElement as never, props) as ReactElement;
}
