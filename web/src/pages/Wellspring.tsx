import { Link } from 'react-router-dom';
import { ArrowClockwise, ArrowUpRight, CheckCircle, Info, Warning } from '@phosphor-icons/react';
import { useQuench } from '../client';
import { formatAmount, formatDate, formatDateTime, formatPct, formatRate } from '../client/math';
import { useAction } from '../lib/useAction';
import { Banner } from '../components/Banner';
import { Button } from '../components/Button';
import { PageHeader } from '../components/PageHeader';
import { Panel } from '../components/Panel';
import { RateStatusPill } from '../components/RateStatusPill';
import { StateBanner } from '../components/StateBanner';
import { Stat } from '../components/Stat';

export default function Wellspring() {
  const { client, snapshot } = useQuench();
  const { busy, error, run } = useAction();
  const yieldAvailable = snapshot.metrics.yieldSinceHarvestInj;
  const paused = snapshot.protocol.pausedHarvest || snapshot.network === 'wrong';
  const debt = snapshot.position.debtQinj;
  const qinj = snapshot.position.qinjBalance;
  const harvestEvents = snapshot.events.filter((event) => event.type === 'harvest').slice(-8).reverse();
  const lastHarvest = harvestEvents[0];
  const canHarvest = !paused && debt > 0n && yieldAvailable > 0n;

  const harvest = () => run('harvest', () => client.harvest());

  return (
    <div className="page">
      <PageHeader
        kicker="Wellspring"
        title="The yield is the payment."
        lede="Wellspring reads only the LST exchange-rate delta. It burns qINJ from this wallet against the debt. No reward claims, no side channel, no interest."
        aside={
          <div className="page-head__aside-stack">
            <RateStatusPill
              status={snapshot.rate.status}
              rate={`${formatRate(snapshot.rate.value)} INJ/stINJ`}
            />
            <span className="mono page-head__aside-note">
              APR assumption {formatPct(snapshot.rate.aprBps)}
            </span>
          </div>
        }
      />

      <StateBanner />
      {error ? (
        <Banner tone="danger" title="Harvest failed">
          {error}
        </Banner>
      ) : null}

      {debt > 0n && qinj === 0n ? (
        <Banner tone="warn" title="No qINJ in this wallet">
          Wellspring can only burn qINJ that is held here. The pending yield stays unharvested until
          qINJ returns. This is a deliberate limit of the demo’s repayment model.
        </Banner>
      ) : null}

      <div className="well-grid">
        <div className="well-grid__main">
          <Panel
            className="well-hero"
            meta="Harvest / exchange-rate delta"
            title="Pending repayment"
            action={<span className="panel__hint">burned, not claimed</span>}
          >
            <div className="well-hero__value">
              <strong>{formatAmount(yieldAvailable, 4)}</strong>
              <span>INJ of yield since the last harvest</span>
            </div>
            <div className="well-hero__meta">
              <div>
                <span>Debt now</span>
                <strong>{formatAmount(debt, 2)} qINJ</strong>
              </div>
              <div>
                <span>qINJ available to burn</span>
                <strong>{formatAmount(qinj, 2)} qINJ</strong>
              </div>
              <div>
                <span>Last harvest</span>
                <strong>{lastHarvest ? formatDate(lastHarvest.at) : 'never'}</strong>
              </div>
            </div>
            <div className="well-hero__action">
              <Button
                size="lg"
                onClick={harvest}
                loading={busy === 'harvest'}
                disabled={!canHarvest}
                data-testid="harvest-button"
                iconRight={<ArrowClockwise size={18} weight="bold" aria-hidden="true" />}
              >
                Harvest yield
              </Button>
              <Link to="/app/confluence" className="text-link">
                Redeem qINJ instead
                <ArrowUpRight size={14} weight="bold" aria-hidden="true" />
              </Link>
            </div>
            {debt === 0n ? (
              <Banner tone="success" title="No debt to cool" compact>
                Yield stays in the collateral value. Withdraw the collateral from the Basin when
                you are ready.
              </Banner>
            ) : null}
            {paused && debt > 0n ? (
              <Banner tone="warn" title="Harvest is paused" compact>
                The rate is {snapshot.rate.status} or the network is wrong. Redemption and zero-debt
                withdrawal remain open.
              </Banner>
            ) : null}
          </Panel>

          <Panel
            meta="Ledger"
            title="Harvest history"
            action={<Link to="/app/activity" className="panel__hint">All activity</Link>}
          >
            {harvestEvents.length === 0 ? (
              <div className="ledger-empty">
                <CheckCircle size={20} weight="regular" aria-hidden="true" />
                <p>No harvest yet. Advance the simulated clock or wait for the rate to move.</p>
              </div>
            ) : (
              <ul className="ledger-list">
                {harvestEvents.map((event) => (
                  <li className="ledger-list__item" key={event.id}>
                    <span className={`ledger-list__icon ledger-list__icon--${event.status}`}>
                      <ArrowClockwise size={16} weight="regular" aria-hidden="true" />
                    </span>
                    <div className="ledger-list__copy">
                      <strong>{event.title}</strong>
                      <span>{event.detail}</span>
                    </div>
                    <div className="ledger-list__meta">
                      {event.amount ? (
                        <span>
                          {formatAmount(event.amount, 2)} {event.unit}
                        </span>
                      ) : null}
                      <time dateTime={new Date(event.at).toISOString()}>
                        {formatDateTime(event.at)}
                      </time>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <aside className="well-grid__side">
          <Panel meta="Mechanism" title="One source of yield">
            <div className="mechanism">
              <div className="mechanism__row">
                <span>Rate before</span>
                <strong>{formatRate(snapshot.rate.min)}</strong>
              </div>
              <div className="mechanism__row">
                <span>Current rate</span>
                <strong>{formatRate(snapshot.rate.value)}</strong>
              </div>
              <div className="mechanism__row">
                <span>Bounds</span>
                <strong>
                  {formatRate(snapshot.rate.min)}–{formatRate(snapshot.rate.max)}
                </strong>
              </div>
              <div className="mechanism__row">
                <span>Updated</span>
                <strong>{formatDate(snapshot.rate.updatedAt)}</strong>
              </div>
            </div>
            <p className="side-panel__note">
              The exchange rate is the only yield input. If the rate is stale, out of bounds, or
              drops, harvest pauses; the pending yield is not invented or side-channeled.
            </p>
          </Panel>

          <div className="stat-grid stat-grid--two">
            <Stat
              label="Debt"
              value={formatAmount(debt, 2)}
              unit="qINJ"
              tone={debt > 0n ? 'danger' : 'success'}
            />
            <Stat
              label="Wallet"
              value={formatAmount(qinj, 2)}
              unit="qINJ"
              note="the burn source"
            />
          </div>

          <div className="instrument-note">
            <div className="instrument-note__title">
              <Info size={14} weight="bold" aria-hidden="true" /> What if qINJ is elsewhere?
            </div>
            <p>
              Automatic repayment is limited by the wallet. If you sold or moved qINJ, the debt
              stays open and the position cannot withdraw. The UI reports partial harvests rather
              than pretending the loan is self-repaying.
            </p>
          </div>

          <div className="instrument-note instrument-note--warn">
            <div className="instrument-note__title">
              <Warning size={14} weight="bold" aria-hidden="true" /> No interest
            </div>
            <p>
              The demo charges no interest. It is not a yield forecast. The staking APR is a
              scenario input, sourced and dated in Sources.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}