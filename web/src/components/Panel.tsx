import type { ReactNode } from 'react';

export function Panel({
  children,
  className,
  title,
  meta,
  action,
  as: Tag = 'section',
}: {
  children: ReactNode;
  className?: string;
  title?: string;
  meta?: ReactNode;
  action?: ReactNode;
  as?: 'section' | 'div' | 'article';
}) {
  return (
    <Tag className={`panel${className ? ` ${className}` : ''}`}>
      {title || meta || action ? (
        <div className="panel__head">
          <div>
            {meta ? <div className="panel__meta">{meta}</div> : null}
            {title ? <h2 className="panel__title">{title}</h2> : null}
          </div>
          {action ? <div className="panel__action">{action}</div> : null}
        </div>
      ) : null}
      {children}
    </Tag>
  );
}