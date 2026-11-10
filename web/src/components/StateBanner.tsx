import { Link } from 'react-router-dom';
import { useQuench } from '../client';
import { formatRate } from '../client/math';
import { Banner } from './Banner';

export function StateBanner() {
  const { snapshot } = useQuench();
  const { rate, protocol } = snapshot;
  const liquidating = protocol.liquidationEligible;

  if (rate.status === 'fresh' && !liquidating) return null;

  if (liquidating) {
    return (
      <div data-testid="state-banner">
        <Banner
          tone="danger"
          title="Liquidation-eligible"
          action={
            <Link className="banner__link" to="/app/swap">
              Redemption stays open
            </Link>
          }
        >
          Debt exceeds the maximum LTV after the rate drop. Borrowing and auto-repay are paused. A
          simulation liquidation can clear the position and record bad debt.
        </Banner>
      </div>
    );
  }

  const titles: Record<typeof rate.status, string> = {
    fresh: 'Rate is fresh',
    stale: 'Rate is stale',
    'out-of-bounds': 'Rate is outside its bounds',
    drop: 'stINJ exchange rate dropped',
  };

  const body: Record<typeof rate.status, string> = {
    fresh: '',
    stale: `The last rate update is older than ${snapshot.config.staleAfterDays} days. Borrowing and auto-repay are paused until the rate refreshes.`,
    'out-of-bounds': `The rate ${formatRate(rate.value)} is outside ${formatRate(rate.min)}–${formatRate(rate.max)}. Borrowing and auto-repay are paused.`,
    drop: `The rate is ${formatRate(rate.value)} after a downward move. Borrowing and auto-repay are paused. Redemption and zero-debt withdrawal stay open.`,
  };

  return (
    <div data-testid="state-banner">
      <Banner
        tone={rate.status === 'drop' ? 'danger' : 'warn'}
        title={titles[rate.status]}
        action={
          <Link className="banner__link" to="/app/swap">
            Exits are open
          </Link>
        }
      >
        {body[rate.status]} Pausing never blocks an honest exit.
      </Banner>
    </div>
  );
}