interface ToggleProps {
  checked: boolean;
  disabled?: boolean;
  label: string;
  description?: string;
  onChange: (checked: boolean) => void;
}

export function Toggle({ checked, disabled, label, description, onChange }: ToggleProps) {
  return (
    <label class="toggle">
      <span class="toggle__copy">
        <strong>{label}</strong>
        {description && <small>{description}</small>}
      </span>
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.currentTarget.checked)}
      />
      <span class="toggle__track" aria-hidden="true">
        <span />
      </span>
    </label>
  );
}
