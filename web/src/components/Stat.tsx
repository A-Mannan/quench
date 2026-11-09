import type { ReactNode } from 'react';

export function Stat({
  label,
  value,
  unit,
  note,
  tone = 'default',
  size = 'md',
  className,
}: {
  label: string;
  value: ReactNode;
  unit?: string;
  note?: ReactNode;
  tone?: 'default' | 'accent' | 'danger' | 'success' | 'muted';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}) {
  return (
    <div className={`stat stat--${size} stat--${tone}${className ? ` ${className}` : ''}`}>
      <div className="stat__label">{label}</div>
      <div className="stat__value">
        {value}
        {unit ? <span className="stat__unit">{unit}</span> : null}
      </div>
      {note ? <div className="stat__note">{note}</div> : null}
    </div>
  );
}