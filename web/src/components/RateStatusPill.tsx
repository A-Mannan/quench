import type { RateStatus } from '../client/types';

const LABELS: Record<RateStatus, string> = {
  fresh: 'Fresh rate',
  stale: 'Rate stale',
  'out-of-bounds': 'Rate out of bounds',
  drop: 'Rate drop',
};

export function RateStatusPill({
  status,
  rate,
}: {
  status: RateStatus;
  rate: string;
}) {
  return (
    <span className={`rate-pill rate-pill--${status}`} data-testid="rate-status">
      <span className="rate-pill__dot" aria-hidden="true" />
      <span>{LABELS[status]}</span>
      <span className="rate-pill__rate">{rate}</span>
    </span>
  );
}