import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from '@phosphor-icons/react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface CommonProps {
  variant?: Variant;
  size?: Size;
  iconRight?: ReactNode;
  full?: boolean;
  loading?: boolean;
  children: ReactNode;
  className?: string;
}

function classes({
  variant = 'primary',
  size = 'md',
  full,
  className,
}: CommonProps): string {
  return [
    'button',
    `button--${variant}`,
    `button--${size}`,
    full ? 'button--full' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');
}

function ButtonInner({
  loading,
  iconRight,
  children,
}: Pick<CommonProps, 'loading' | 'iconRight' | 'children'>) {
  return (
    <>
      {loading ? <span className="button__spinner" aria-hidden="true" /> : null}
      <span>{children}</span>
      {iconRight ?? (loading ? null : <ArrowRight size={16} weight="bold" aria-hidden="true" />)}
    </>
  );
}

export function Button({
  variant,
  size,
  iconRight,
  full,
  loading,
  children,
  className,
  disabled,
  type = 'button',
  ...rest
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={classes({ variant, size, full, loading, children, className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      <ButtonInner loading={loading} iconRight={iconRight}>
        {children}
      </ButtonInner>
    </button>
  );
}

export function ButtonLink({
  to,
  variant,
  size,
  iconRight,
  full,
  children,
  className,
  onClick,
}: CommonProps & { to: string; onClick?: () => void }) {
  return (
    <Link
      to={to}
      className={classes({ variant, size, full, children, className })}
      onClick={onClick}
    >
      <ButtonInner iconRight={iconRight}>{children}</ButtonInner>
    </Link>
  );
}