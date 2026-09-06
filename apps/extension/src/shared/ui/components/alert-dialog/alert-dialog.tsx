import type { ComponentChildren } from 'preact';
import * as RadixAlertDialog from 'radix-ui/alert-dialog';
import { Button } from '@/shared/ui/components/button';
import styles from './alert-dialog.module.css';

interface AlertDialogProps {
  open: boolean;
  title: string;
  description: ComponentChildren;
  confirmLabel: string;
  cancelLabel?: string;
  loading?: boolean;
  variant?: 'dark' | 'destructive';
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function AlertDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancelar',
  loading = false,
  variant = 'destructive',
  onOpenChange,
  onConfirm,
}: AlertDialogProps) {
  return (
    <RadixAlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixAlertDialog.Portal>
        <RadixAlertDialog.Overlay className={styles.overlay} />
        <RadixAlertDialog.Content className={styles.content}>
          <RadixAlertDialog.Title className={styles.title}>
            {title}
          </RadixAlertDialog.Title>
          <RadixAlertDialog.Description className={styles.description}>
            {description}
          </RadixAlertDialog.Description>
          <div className={styles.actions}>
            <RadixAlertDialog.Cancel asChild>
              <Button variant="secondary">{cancelLabel}</Button>
            </RadixAlertDialog.Cancel>
            <RadixAlertDialog.Action asChild>
              <Button variant={variant} loading={loading} onClick={onConfirm}>
                {confirmLabel}
              </Button>
            </RadixAlertDialog.Action>
          </div>
        </RadixAlertDialog.Content>
      </RadixAlertDialog.Portal>
    </RadixAlertDialog.Root>
  );
}
