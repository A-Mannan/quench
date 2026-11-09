import { useState } from 'react';
import { ArrowClockwise } from '@phosphor-icons/react';
import { useQuench } from '../client';
import { formatAmount, formatDateTime, formatPct } from '../client/math';
import { useAction } from '../lib/useAction';
import { Banner } from '../components/Banner';
import { Button, ButtonLink } from '../components/Button';
import { InstrumentBar } from '../components/InstrumentBar';
import { StateBanner } from '../components/StateBanner';

export default function Wellspring() {
  const { client, snapshot } = useQuench();
  const { busy, error, run } = useAction();
  const [onlyActive, setOnlyActive] = useState(true);
  const yieldAvailable = snapshot.metrics.yieldSinceHarvestInj;
  const paused = snapshot.protocol.pausedHarvest || snapshot.network === 'wrong';
  const debt = snapshot.position.debtQinj;
  const qinj = snapshot.position.qinjBalance;
  const harvestEvents = snapshot.events.filter((event) => event.type === 'harvest').slice(-8).reverse();
  const canHarvest = !paused && debt > 0n && yieldAvailable > 0n;
  const ltv = snapshot.metrics.ltvBps;
  const ltvFill = Math.min(100, (ltv / snapshot.config.maxLtvBps) * 100);

  const harvest = () => run('harvest', () => client.harvest());

  return (
    <div className="page-simple">
      <StateBanner />
      {error ? (
        <Banner tone="danger" title="Harvest failed">
          {error}
        </Banner>
      ) : null}

      {debt > 0n && qinj === 0n ? (
        <Banner tone="warn" title="No qINJ in wallet">
          Add qINJ to repay. Yield is waiting.
        </Banner>
      ) : null}

      <section className="card" aria-label="Your positions">
        <InstrumentBar crumb="Basin / position" chainId={snapshot.chainId} />
        <div className="card__head">
          <h2>
            Your positions <span className="count-badge">1</span>
          </h2>
          <label className="check">
            <input type="checkbox" checked={onlyActive} onChange={(e) => setOnlyActive(e.target.checked)} />
            Show only Active positions
          </label>
        </div>
        {debt > 0n || !onlyActive ? (
          <div className="pos-row">
            <span className="pos-row__icon" aria-hidden="true">
              Q
            </span>
            <div>
              <div className="pos-row__meta">
                <span>
                  <strong>BASIN</strong> · stINJ
                </span>
                <span>{(ltv / 100).toFixed(0)}%</span>
              </div>
              <div className={`pos-bar ${debt === 0n ? 'pos-bar--blue' : 'pos-bar--green'}`}>
                <span style={{ width: `${debt === 0n ? 100 : ltvFill}%` }} />
              </div>
            </div>
            <span className={`pos-status ${debt === 0n ? 'pos-status--matured' : 'pos-status--active'}`}>
              <i aria-hidden="true" />
              {debt === 0n ? 'Matured' : 'Active'}
            </span>
          </div>
        ) : (
          <p className="muted position-none">No active positions.</p>
        )}
        <div className="detail-wrap">
          <div className="detail-hero">
            <div>
              <strong>BASIN</strong>
              <span>stINJ</span>
            </div>
            <div>
              <p>Staking yield pays the loan down. No liquidation risk.</p>
            </div>
          </div>
          <div className="detail-side">
            <h2>Pending repayment</h2>
            <div className="hero-amount">
              <strong>{formatAmount(yieldAvailable, 4)}</strong>
              <span>INJ yield to burn</span>
            </div>
            <div className="loan-field">
              <span className="k">
                Collateral
              </span>
              <span className="v">{formatAmount(snapshot.position.collateralLst, 2)} stINJ</span>
              <span className="s">{formatAmount(snapshot.metrics.collateralValueInj, 2)} INJ · {formatPct(snapshot.rate.aprBps)} APY</span>
            </div>
            <div className="loan-field">
              <span className="k">
                Debt
              </span>
              <span className="v">{formatAmount(debt, 2)} qINJ</span>
              <span className="s">qINJ to burn: {formatAmount(qinj, 2)}</span>
            </div>
            <div className="progress" aria-hidden="true">
              <span style={{ width: `${ltvFill}%` }} />
            </div>
            <div className="action-row">
              <Button
                full
                onClick={harvest}
                loading={busy === 'harvest'}
                disabled={!canHarvest}
                data-testid="harvest-button"
                iconRight={<ArrowClockwise size={18} weight="bold" aria-hidden="true" />}
              >
                Harvest yield
              </Button>
              <ButtonLink to="/app/swap" variant="secondary" full>
                Redeem
              </ButtonLink>
            </div>
            {debt === 0n ? (
              <p className="fine">No debt. Withdraw in Basin.</p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="card" aria-label="History">
        <InstrumentBar crumb="History / 01" chainId={snapshot.chainId} />
        <h2>History</h2>
        {harvestEvents.length === 0 ? (
          <p className="muted">No harvests yet.</p>
        ) : (
          <ul className="simple-list">
            {harvestEvents.map((event) => (
              <li key={event.id}>
                <span>{event.title}</span>
                <span className="muted-inline">
                  {event.amount ? `${formatAmount(event.amount, 2)} ${event.unit}` : ''} {formatDateTime(event.at)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
