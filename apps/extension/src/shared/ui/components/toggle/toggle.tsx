import * as Switch from 'radix-ui/switch';
import styles from './toggle.module.css';

export function Toggle({
  checked,
  disabled = false,
  label,
  description,
  onCheckedChange,
}: {
  checked: boolean;
  disabled?: boolean;
  label: string;
  description?: string;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <label class={styles.toggle}>
      <span class={styles.copy}>
        <strong>{label}</strong>
        {description && <small>{description}</small>}
      </span>
      <Switch.Root
        className={styles.root}
        checked={checked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
      >
        <Switch.Thumb className={styles.thumb} />
      </Switch.Root>
    </label>
  );
}
