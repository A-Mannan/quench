import { Link } from 'react-router-dom';

export function Wordmark({
  to,
  compact = false,
  inverse = false,
}: {
  to?: string;
  compact?: boolean;
  inverse?: boolean;
}) {
  const content = (
    <>
      <svg
        className="wordmark__mark"
        viewBox="0 0 24 24"
        aria-hidden="true"
        fill="none"
      >
        <path
          d="M12 3.2C12 3.2 5.6 10.2 5.6 14.4a6.4 6.4 0 0 0 12.8 0C18.4 10.2 12 3.2 12 3.2Z"
          stroke="currentColor"
          strokeWidth="2.1"
        />
        <path
          className="wordmark__tail"
          d="M8.8 15.2h6.4"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="square"
        />
      </svg>
      {!compact ? <span className="wordmark__text">quench</span> : null}
    </>
  );

  const className = `wordmark${inverse ? ' wordmark--inverse' : ''}`;
  return to ? (
    <Link to={to} className={className} aria-label="Quench home">
      {content}
    </Link>
  ) : (
    <span className={className}>{content}</span>
  );
}
