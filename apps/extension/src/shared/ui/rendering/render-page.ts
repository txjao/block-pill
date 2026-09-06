import { render, type ComponentChild } from 'preact';

export function renderPage(content: ComponentChild): void {
  const root = document.querySelector('#app');

  if (!(root instanceof HTMLElement)) {
    throw new Error('Elemento raiz da interface não encontrado.');
  }

  render(content, root);
}
