import type { ReactNode } from 'react';
import { Info, Warning, CheckCircle, XCircle } from '@phosphor-icons/react';

type Tone = 'info' | 'warn' | 'danger' | 'success';

const ICONS = {
  info: Info,
  warn: Warning,
  danger: XCircle,
  success: CheckCircle,
};

const FLAGS = {
  info: 'Notice',
  warn: 'Warning',
  danger: 'Blocked',
  success: 'Confirmed',
};

export function Banner({
  tone = 'info',
  title,
  children,
  action,
  compact = false,
}: {
  tone?: Tone;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  compact?: boolean;
}) {
  const Icon = ICONS[tone];
  return (
    <div
      className={`banner banner--${tone}${compact ? ' banner--compact' : ''}`}
      role={tone === 'danger' || tone === 'warn' ? 'alert' : 'status'}
    >
      <div className="banner__flag" aria-hidden="true">
        <Icon size={16} weight="bold" className="banner__icon" />
        <span>{FLAGS[tone]}</span>
      </div>
      <div className="banner__body">
        <strong className="banner__title">{title}</strong>
        {children ? <div className="banner__text">{children}</div> : null}
      </div>
      {action ? <div className="banner__action">{action}</div> : null}
    </div>
  );
}