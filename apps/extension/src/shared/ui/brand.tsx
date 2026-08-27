import blockPillIcon from '../../../../../shared/brand/icons/block-pill-transparent.svg?url';

interface BrandProps {
  title: string;
}

export function Brand({ title }: BrandProps) {
  return (
    <div class="brand">
      <img src={blockPillIcon} alt="" />
      <h1>{title}</h1>
    </div>
  );
}
