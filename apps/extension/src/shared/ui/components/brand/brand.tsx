import blockPillIcon from '@workspace/shared/brand/icons/block-pill-transparent.svg?url';
import filledIcon from '@workspace/shared/brand/icons/block-pill-filled.svg?url';
import styles from './brand.module.css';

export function Brand({
  label = 'Block Pill',
  variant = 'default',
}: {
  label?: string;
  variant?: 'default' | 'inverse';
}) {
  return (
    <span class={`${styles.brand} ${styles[variant]}`}>
      <img src={variant === 'inverse' ? filledIcon : blockPillIcon} alt="" />
      <span>{label}</span>
    </span>
  );
}
