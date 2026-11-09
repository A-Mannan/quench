import type { ReactNode } from 'react';

export interface ConsequenceItem {
  label: string;
  value: ReactNode;
  tone?: 'default' | 'danger' | 'success' | 'muted';
}

export function Consequences({
  items,
  title = 'What changes',
}: {
  items: ConsequenceItem[];
  title?: string;
}) {
  return (
    <div className="consequences">
      <div className="consequences__title">{title}</div>
      <dl className="consequences__list">
        {items.map((item) => (
          <div className={`consequences__row consequences__row--${item.tone ?? 'default'}`} key={item.label}>
            <dt>{item.label}</dt>
            <dd>{item.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}