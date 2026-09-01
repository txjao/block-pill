import type { ComponentChildren } from 'preact';
import * as RadixTabs from 'radix-ui/tabs';
import styles from './tabs.module.css';

export interface TabItem<T extends string> {
  value: T;
  label: string;
  count?: number;
}

export function Tabs<T extends string>({
  value,
  items,
  note,
  children,
  onValueChange,
}: {
  value: T;
  items: Array<TabItem<T>>;
  note?: ComponentChildren;
  children: ComponentChildren;
  onValueChange: (value: T) => void;
}) {
  return (
    <RadixTabs.Root value={value} onValueChange={(next) => onValueChange(next as T)}>
      <div class={styles.header}>
        <RadixTabs.List className={styles.list} aria-label="Alternar conteúdo">
          {items.map((item) => (
            <RadixTabs.Trigger className={styles.trigger} value={item.value} key={item.value}>
              {item.label}
              {item.count !== undefined && <span> · {item.count}</span>}
            </RadixTabs.Trigger>
          ))}
        </RadixTabs.List>
        {note && <span class={styles.note}>{note}</span>}
      </div>
      {children}
    </RadixTabs.Root>
  );
}

export function TabsContent({ value, children }: { value: string; children: ComponentChildren }) {
  return (
    <RadixTabs.Content className={styles.content} value={value} forceMount>
      {children}
    </RadixTabs.Content>
  );
}
