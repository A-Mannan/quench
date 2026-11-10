import { useState } from 'react';
import { useQuench, ONE } from '../client';
import { formatAmount, formatPct, mulDiv, parseTokenInput } from '../client/math';
import { useAction } from '../lib/useAction';
import { AmountField } from '../components/AmountField';
import { Banner } from '../components/Banner';
import { Button, ButtonLink } from '../components/Button';
import { InstrumentBar } from '../components/InstrumentBar';
import { StateBanner } from '../components/StateBanner';

export default function Basin() {
  const { client, snapshot } = useQuench();
  const { busy, error, run } = useAction();
  const [withdrawInput, setWithdrawInput] = useState('');

  const withdrawAmount = parseTokenInput(withdrawInput);
  const remainingCollateral =
    snapshot.position.collateralLst >= withdrawAmount
      ? snapshot.position.collateralLst - withdrawAmount
      : 0n;
  const remainingCollateralValue = mulDiv(
    remainingCollateral,
    snapshot.rate.value,
    ONE,
  );
  const maxDebtAfter = mulDiv(
    remainingCollateralValue,
    BigInt(snapshot.config.maxLtvBps),
    10_000n,
  );
  const ltvAfter =
    remainingCollateralValue === 0n
      ? snapshot.position.debtQinj > 0n
        ? 10_000
        : 0
      : Number((snapshot.position.debtQinj * 10_000n) / remainingCollateralValue);
  const denominator = snapshot.rate.value * BigInt(snapshot.config.maxLtvBps);
  const minimumCollateral =
    denominator === 0n
      ? 0n
      : (snapshot.position.debtQinj * ONE * 10_000n + denominator - 1n) / denominator;
  const safeWithdrawal =
    snapshot.position.collateralLst > minimumCollateral
      ? snapshot.position.collateralLst - minimumCollateral
      : 0n;
  const fieldEnabled =
    snapshot.position.collateralLst > 0n &&
    snapshot.network === 'testnet' &&
    (snapshot.position.debtQinj === 0n ||
      (snapshot.rate.status === 'fresh' &&
        !snapshot.protocol.liquidationEligible &&
        safeWithdrawal > 0n));
  const withdrawError =
    withdrawAmount > 0n && withdrawAmount > snapshot.position.collateralLst
      ? `Exceeds collateral (${formatAmount(snapshot.position.collateralLst, 2)} stINJ).`
      : snapshot.position.debtQinj > 0n &&
          withdrawAmount > 0n &&
          snapshot.position.debtQinj > maxDebtAfter
        ? `That would push LTV to ${formatPct(ltvAfter)}; leave at least ${formatAmount(minimumCollateral, 2)} stINJ.`
        : undefined;
  const canWithdraw =
    fieldEnabled &&
    withdrawAmount > 0n &&
    withdrawAmount <= snapshot.position.collateralLst &&
    !withdrawError;

  const ltvFill = Math.min(100, ltvAfter / 100);
  const hasChange = withdrawAmount > 0n;
  const withdrawn =
    withdrawAmount > snapshot.position.collateralLst
      ? snapshot.position.collateralLst
      : withdrawAmount;

  const withdraw = async () => {
    await run('withdraw', async () => {
      await client.withdraw(withdrawAmount);
      setWithdrawInput('');
    });
  };

  if (snapshot.position.collateralLst === 0n) {
    return (
      <div className="page-simple page-simple--narrow">
        <StateBanner />
        <section className="card empty-simple" aria-label="Withdraw collateral">
          <InstrumentBar crumb="Withdraw" chainId={snapshot.chainId} />
          <h2>Nothing to withdraw</h2>
          <p className="muted">
            Add collateral from Loans first. Withdrawals stay open at zero debt.
          </p>
          <ButtonLink to="/app/loans" full size="lg">
            Add collateral &amp; borrow
          </ButtonLink>
        </section>
      </div>
    );
  }

  return (
    <div className="page-simple page-simple--narrow">
      <StateBanner />
      {error ? (
        <Banner tone="danger" title="Withdraw action failed">
          {error}
        </Banner>
      ) : null}

      <section className="card" aria-label="Withdraw collateral">
        <InstrumentBar crumb="Withdraw" chainId={snapshot.chainId} />
        <h2 className="loan-head">Withdraw</h2>
        <AmountField
          id="withdraw-amount"
          label="Amount to withdraw"
          value={withdrawInput}
          onChange={setWithdrawInput}
          unit="stINJ"
          maxLabel={`Collateral ${formatAmount(snapshot.position.collateralLst, 2)}`}
          onMax={() => setWithdrawInput(formatAmount(
            snapshot.position.debtQinj === 0n
              ? snapshot.position.collateralLst
              : safeWithdrawal,
            18,
          ))}
          helper={
            snapshot.position.debtQinj > 0n
              ? safeWithdrawal > 0n
                ? `Safe withdrawal ${formatAmount(safeWithdrawal, 2)} stINJ`
                : 'Locked until debt is lowered.'
              : undefined
          }
          disabled={!fieldEnabled}
          error={withdrawError}
        />
        <div className="after-strip" aria-live="polite" aria-label="After this transaction">
          <div className="after-strip__head">
            <span className={`after-strip__dot${hasChange ? ' is-live' : ''}`} aria-hidden="true" />
            <span>{hasChange ? 'After this transaction' : 'Current position'}</span>
          </div>
          <dl className="after-strip__grid">
            <div>
              <dt>Collateral</dt>
              <dd>{formatAmount(remainingCollateral, 2)} <span>stINJ</span></dd>
              <small>{hasChange ? `−${formatAmount(withdrawn, 2)}` : 'Unchanged'}</small>
            </div>
            <div>
              <dt>Debt</dt>
              <dd>{formatAmount(snapshot.position.debtQinj, 2)} <span>qINJ</span></dd>
              <small>Unchanged</small>
            </div>
            <div>
              <dt>LTV</dt>
              <dd>{formatPct(ltvAfter)}</dd>
              <small>of {formatPct(snapshot.config.maxLtvBps)} max</small>
            </div>
          </dl>
          <div className="after-strip__meter">
            <span>
              {snapshot.position.debtQinj === 0n
                ? 'Full exit open'
                : `Headroom ${formatAmount(maxDebtAfter > snapshot.position.debtQinj ? maxDebtAfter - snapshot.position.debtQinj : 0n, 2)} qINJ`}
            </span>
            <span className="after-strip__bar" aria-hidden="true">
              <span style={{ width: `${ltvFill}%` }} />
            </span>
          </div>
        </div>
        <Button
          full
          size="lg"
          onClick={withdraw}
          loading={busy === 'withdraw'}
          disabled={!canWithdraw}
          data-testid="withdraw-submit"
          iconRight={false}
        >
          Withdraw stINJ
        </Button>
      </section>
    </div>
  );
}
