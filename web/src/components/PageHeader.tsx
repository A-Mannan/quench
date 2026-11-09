import type { ReactNode } from 'react';

export function PageHeader({
  kicker,
  title,
  lede,
  aside,
}: {
  kicker: string;
  title: string;
  lede: string;
  aside?: ReactNode;
}) {
  return (
    <header className="page-head">
      <div className="page-head__copy">
        <div className="kicker">{kicker}</div>
        <h1 className="page-head__title">{title}</h1>
        <p className="page-head__lede">{lede}</p>
      </div>
      {aside ? <div className="page-head__aside">{aside}</div> : null}
    </header>
  );
}