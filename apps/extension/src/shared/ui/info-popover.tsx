import { useId, useState } from 'preact/hooks';
import type { ComponentChildren } from 'preact';

interface InfoPopoverProps {
  label: string;
  children: ComponentChildren;
}

export function InfoPopover({ label, children }: InfoPopoverProps) {
  const [open, setOpen] = useState(false);
  const id = useId();
  
  return (
    <span class="info-popover">
      <button
        class="info-popover__trigger"
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(!open)}
      >
        i
      </button>
      {open && (
        <span class="info-popover__content" id={id}>
          {children}
          <button
            class="text-button info-popover__close"
            type="button"
            onClick={() => setOpen(false)}
          >
            Fechar
          </button>
        </span>
      )}
    </span>
  );
}
