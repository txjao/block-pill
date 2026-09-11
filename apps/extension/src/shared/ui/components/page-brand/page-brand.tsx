import blockPillIcon from '@workspace/shared/brand/icons/block-pill-transparent.svg?url';
import styles from './page-brand.module.css';

interface PageBrandProps {
  title: string;
}

export function PageBrand({ title }: PageBrandProps) {
  return (
    <div class={styles.root}>
      <img class={styles.icon} src={blockPillIcon} alt="" />
      <h1 class={styles.title}>{title}</h1>
    </div>
  );
}
