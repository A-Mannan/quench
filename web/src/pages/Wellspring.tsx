import { useState } from 'react';
import { ArrowClockwise } from '@phosphor-icons/react';
import { useQuench } from '../client';
import { formatAmount, formatPct, parseTokenInput } from '../client/math';
import { useAction } from '../lib/useAction';
import { Banner } from '../components/Banner';
import { Button, ButtonLink } from '../components/Button';
import { EmptyPosition } from '../components/EmptyPosition';
import { InstrumentBar } from '../components/InstrumentBar';
import { StateBanner } from '../components/StateBanner';

export default function Wellspring() {
  const { client, snapshot } = useQuench();
  const { busy, error, run } = useAction();
  const [repayInput, setRepayInput] = useState('');
  const hasPosition = snapshot.position.collateralLst > 0n || snapshot.position.debtQinj > 0n;

  const yieldAvailable = snapshot.metrics.yieldSinceHarvestInj;
  const paused = snapshot.protocol.pausedHarvest || snapshot.network === 'wrong';
  const debt = snapshot.position.debtQinj;
  const qinj = snapshot.position.qinjBalance;
  const canHarvest = !paused && debt > 0n && yieldAvailable > 0n;
  const ltv = snapshot.metrics.ltvBps;
  const ltvFill = Math.min(100, (ltv / snapshot.config.maxLtvBps) * 100);
  const repayAmount = parseTokenInput(repayInput);
  const maxRepay = qinj < debt ? qinj : debt;
  const repayError =
    repayAmount > qinj
      ? `Exceeds qINJ balance (${formatAmount(qinj, 2)} qINJ).`
      : repayAmount > debt
        ? `Exceeds debt (${formatAmount(debt, 2)} qINJ).`
        : undefined;
  const canRepay =
    snapshot.network === 'testnet' &&
    repayAmount > 0n &&
    repayAmount <= qinj &&
    repayAmount <= debt;
  const canSelfLiquidate =
    snapshot.network === 'testnet' &&
    debt > 0n &&
    snapshot.position.collateralLst > 0n &&
    !snapshot.protocol.liquidated;
  const isActive = debt > 0n;

  const harvest = () => run('harvest', () => client.harvest());
  const repay = async () => {
    await run('repay', async () => {
      await client.repay(repayAmount);
      setRepayInput('');
    });
  };

  const selfLiquidate = () => run('self-liquidate', () => client.selfLiquidate());

  if (!hasPosition) {
    return (
      <div className="page-simple page-simple--narrow">
        <StateBanner />
        {error ? (
          <Banner tone="danger" title="Action failed">
            {error}
          </Banner>
        ) : null}
        <EmptyPosition />
      </div>
    );
  }

  return (
    <div className="page-simple page-simple--narrow">
      <StateBanner />
      {error ? (
        <Banner tone="danger" title="Action failed">
          {error}
        </Banner>
      ) : null}

      {debt > 0n && qinj === 0n ? (
        <Banner tone="warn" title="No qINJ in wallet">
          Add qINJ to repay. Yield is waiting.
        </Banner>
      ) : null}

      <section className="card" aria-label="Position">
        <InstrumentBar crumb="Positions" chainId={snapshot.chainId} />
        <h2 className="loan-head">Position</h2>

        <div className="pos-hero">
          <div className="pos-hero__top">
            <span
              className={`pos-hero__status${isActive ? '' : ' pos-hero__status--matured'}`}
            >
              <i aria-hidden="true" />
              {isActive ? 'Active' : 'Matured'}
            </span>
            <Button
              size="sm"
              variant="secondary"
              onClick={harvest}
              loading={busy === 'harvest'}
              disabled={!canHarvest}
              data-testid="harvest-button"
              iconRight={<ArrowClockwise size={14} weight="bold" aria-hidden="true" />}
            >
              Repay with yield
            </Button>
          </div>
          <div className="pos-hero__amount">
            <strong>{formatAmount(yieldAvailable, 4)}</strong>
            <span>Pending repayment · yield ready to apply</span>
          </div>
        </div>

        <dl className="pos-readouts">
          <div>
            <dt>Collateral</dt>
            <dd>{formatAmount(snapshot.position.collateralLst, 2)} <span>stINJ</span></dd>
          </div>
          <div>
            <dt>Debt</dt>
            <dd>{formatAmount(debt, 2)} <span>qINJ</span></dd>
          </div>
          <div>
            <dt>qINJ in wallet</dt>
            <dd>{formatAmount(qinj, 2)} <span>qINJ</span></dd>
          </div>
          <div>
            <dt>Yield rate</dt>
            <dd>{formatPct(snapshot.rate.aprBps)} <span>APY</span></dd>
          </div>
        </dl>

        <div className="pos-ltv">
          <div className="pos-ltv__meta">
            <span>LTV</span>
            <strong>{(ltv / 100).toFixed(1)}% of {formatPct(snapshot.config.maxLtvBps)} max</strong>
          </div>
          <div className="progress" aria-hidden="true">
            <span style={{ width: `${ltvFill}%` }} />
          </div>
        </div>

        <div className="pos-actions">
          <span className="field-label">Repay with qINJ</span>
          <div className="repay-inline">
            <div className={`token-box amount-field__control${repayError ? ' amount-field--error' : ''}`}>
              <div className="token-box__row">
                <input
                  id="repay-amount"
                  className="amount-field__input"
                  inputMode="decimal"
                  autoComplete="off"
                  spellCheck={false}
                  value={repayInput}
                  onChange={(event) => setRepayInput(event.target.value)}
                  placeholder="0.00"
                  disabled={debt === 0n || qinj === 0n || snapshot.network !== 'testnet'}
                  aria-label="Repay amount"
                  aria-invalid={repayError ? true : undefined}
                  data-testid="repay-input"
                />
                <button
                  type="button"
                  className="chip"
                  onClick={() => setRepayInput(formatAmount(maxRepay, 18))}
                  disabled={debt === 0n || qinj === 0n || snapshot.network !== 'testnet'}
                >
                  Max
                </button>
                <span className="token-pill">
                  <span className="token-ico" aria-hidden="true">Q</span> qINJ
                </span>
              </div>
              {repayError ? (
                <div className="amount-field__help amount-field__help--error" role="alert">{repayError}</div>
              ) : null}
            </div>
            <Button
              onClick={repay}
              loading={busy === 'repay'}
              disabled={!canRepay}
              data-testid="repay-submit"
              iconRight={false}
            >
              Repay
            </Button>
          </div>

          <div className="pos-footer">
            <ButtonLink to="/app/swap" variant="secondary" size="sm" iconRight={false}>
              Swap qINJ
            </ButtonLink>
            <Button
              variant="danger"
              size="sm"
              onClick={selfLiquidate}
              loading={busy === 'self-liquidate'}
              disabled={!canSelfLiquidate}
              data-testid="self-liquidate-submit"
              iconRight={false}
            >
              Self-liquidate
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
