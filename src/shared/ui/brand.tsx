interface BrandProps {
  title: string;
}

export function Brand({ title }: BrandProps) {
  return (
    <div class="brand">
      <img src="/icons/icon-48.png" alt="" />
      <h1>{title}</h1>
    </div>
  );
}
