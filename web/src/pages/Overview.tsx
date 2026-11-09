import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, CheckCircle, Warning } from '@phosphor-icons/react';
import { useQuench, DAY_MS } from '../client';
import { formatAmount, formatDateShort, formatPct, formatRate } from '../client/math';
import type { CurvePoint } from '../domain/curve';
import { projectCurve } from '../domain/curve';
import { useAction } from '../lib/useAction';
import { Banner } from '../components/Banner';
import { BufferGauge } from '../components/BufferGauge';
import { Button, ButtonLink } from '../components/Button';
import { EmptyPosition } from '../components/EmptyPosition';
import { PageHeader } from '../components/PageHeader';
import { Panel } from '../components/Panel';
import { PressureCurve } from '../components/PressureCurve';
import { StateBanner } from '../components/StateBanner';
import { Stat } from '../components/Stat';

const MONTH_MS = 30.4375 * DAY_MS;

function positionLabel(snapshot: ReturnType<typeof useQuench>['snapshot']): {
  label: string;
  tone: string;
} {
  if (snapshot.protocol.liquidated) return { label: 'Liquidated', tone: 'danger' };
  if (snapshot.protocol.liquidationEligible) return { label: 'Liquidation eligible', tone: 'danger' };
  if (snapshot.protocol.pausedMints) return { label: 'Paused', tone: 'warn' };
  if (snapshot.position.debtQinj === 0n && snapshot.position.collateralLst > 0n) {
    return { label: 'Debt cleared', tone: 'success' };
  }
  if (snapshot.metrics.ltvBps > snapshot.config.maxLtvBps * 0.7) {
    return { label: 'Under pressure', tone: 'warn' };
  }
  return { label: 'Cooling', tone: 'ok' };
}

export default function Overview() {
  const { client, snapshot } = useQuench();
  const { busy, error, run } = useAction();
  const hasPosition = snapshot.position.collateralLst > 0n || snapshot.position.debtQinj > 0n;
  const status = positionLabel(snapshot);
  const yieldAvailable = snapshot.metrics.yieldSinceHarvestInj;

  const chart = useMemo(() => {
    const history = snapshot.history;
    if (history.length === 0) return { points: [] as CurvePoint[], currentMonth: 0 };
    const first = history[0]?.t ?? 0;
    const actual: CurvePoint[] = history.map((point) => ({
      month: (point.t - first) / MONTH_MS,
      debt: Number(point.debt) / 1e18,
      collateral: Number(point.collateralValue) / 1e18,
      maxDebt:
        (Number(point.collateralValue) / 1e18) * (snapshot.config.maxLtvBps / 10_000),
    }));
    const last = actual[actual.length - 1];
    if (!last || snapshot.position.debtQinj === 0n) {
      return { points: actual, currentMonth: Math.max(0, actual.length - 1) };
    }
    const projection = projectCurve({
      collateralInj: Number(snapshot.position.collateralLst) / 1e18,
      debtInj: Number(snapshot.position.debtQinj) / 1e18,
      aprBps: snapshot.rate.aprBps,
      maxLtvBps: snapshot.config.maxLtvBps,
      months: 180,
    }).slice(1);
    const projected: CurvePoint[] = projection.map((point) => ({
      ...point,
      month: last.month + point.month,
    }));
    return {
      points: [...actual, ...projected],
      currentMonth: Math.max(0, actual.length - 1),
    };
  }, [snapshot]);

  const harvest = () =>
    run('harvest', () => client.harvest());

  return (
    <div className="page page--overview">
      <PageHeader
        kicker="Overview"
        title={hasPosition ? 'The debt is cooling.' : 'A clean instrument.'}
        lede={
          hasPosition
            ? 'One Basin, one LST, one synthetic. The curve is the position: debt, collateral value, and the headroom that keeps the loan honest.'
            : 'No collateral, no debt. Deposit stINJ to start the loop; every screen will show the consequence before you act.'
        }
        aside={
          <div className="page-head__aside-stack">
            <span className={`position-pill position-pill--${status.tone}`}>
              <span className="position-pill__dot" aria-hidden="true" />
              {status.label}
            </span>
            <span className="mono page-head__aside-note">
              {snapshot.simulation ? formatDateShort(snapshot.simulation.now) : 'simulated clock'}
            </span>
          </div>
        }
      />

      <StateBanner />

      {error ? (
        <Banner tone="danger" title="Action failed">
          {error}
        </Banner>
      ) : null}

      {snapshot.protocol.liquidated ? (
        <Banner tone="danger" title="Position liquidated">
          Collateral seized; {formatAmount(snapshot.protocol.badDebtInj, 2)} INJ recorded as bad
          debt. This path is a simulation, not a production liquidation engine.
        </Banner>
      ) : null}

      {hasPosition && snapshot.position.debtQinj === 0n && snapshot.position.collateralLst > 0n ? (
        <Banner
          tone="success"
          title="Debt is zero"
          action={
            <Link to="/app/basin" className="banner__link">
              Withdraw collateral
            </Link>
          }
        >
          The loan is fully cooled. Withdrawal is enabled even if mints or harvest are paused.
        </Banner>
      ) : null}

      {hasPosition && snapshot.position.debtQinj > 0n && snapshot.position.qinjBalance === 0n ? (
        <Banner tone="warn" title="Wellspring has no qINJ to burn">
          Automatic repayment only burns qINJ held in this wallet. If you moved qINJ out, bring it
          back or use Confluence to understand the exit.
        </Banner>
      ) : null}

      {hasPosition ? (
        <>
          <div className="overview-grid">
            <div className="overview-grid__main">
              <div className="stat-grid stat-grid--four">
                <Stat
                  label="Debt"
                  value={formatAmount(snapshot.position.debtQinj, 2)}
                  unit="qINJ"
                  tone={snapshot.position.debtQinj > 0n ? 'danger' : 'success'}
                  size="lg"
                />
                <Stat
                  label="Collateral"
                  value={formatAmount(snapshot.position.collateralLst, 2)}
                  unit="stINJ"
                  note={`${formatAmount(snapshot.metrics.collateralValueInj, 2)} INJ at ${formatRate(snapshot.rate.value)}`}
                  size="lg"
                />
                <Stat
                  label="Headroom"
                  value={formatAmount(snapshot.metrics.headroomInj, 2)}
                  unit="INJ"
                  note={`${formatPct(snapshot.metrics.ltvBps)} LTV of ${formatPct(snapshot.config.maxLtvBps)} max`}
                  tone={snapshot.metrics.ltvBps > snapshot.config.maxLtvBps * 0.8 ? 'danger' : 'accent'}
                  size="lg"
                />
                <Stat
                  label="qINJ in wallet"
                  value={formatAmount(snapshot.position.qinjBalance, 2)}
                  unit="qINJ"
                  note="Wellspring can burn this against debt"
                  size="lg"
                />
              </div>

              <Panel
                className="chart-panel"
                meta="Position / live simulation"
                title="Pressure curve"
                action={
                  <span className="panel__hint">
                    {snapshot.rate.status === 'fresh' ? 'Rate fresh' : snapshot.rate.status}
                  </span>
                }
              >
                <PressureCurve
                  points={chart.points}
                  currentMonth={chart.currentMonth}
                  eyebrow="Actual history + projection"
                  caption={`Actual simulation points plus a projection at ${formatPct(
                    snapshot.rate.aprBps,
                  )} APR. The rate source is in Sources. This is not a forecast.`}
                  ariaLabel="Debt history and projected debt reduction for the current Basin position"
                />
              </Panel>

              <div className="action-strip">
                <div className="action-strip__copy">
                  <div className="kicker">Next action</div>
                  <strong>
                    {yieldAvailable > 0n && snapshot.position.debtQinj > 0n
                      ? `${formatAmount(yieldAvailable, 2)} INJ of yield is waiting.`
                      : snapshot.position.debtQinj === 0n
                        ? 'Debt is zero. The exit is open.'
                        : 'No yield is waiting yet. Advance the clock or check the rate.'}
                  </strong>
                </div>
                <div className="action-strip__buttons">
                  {yieldAvailable > 0n && snapshot.position.debtQinj > 0n ? (
                    <Button
                      onClick={harvest}
                      loading={busy === 'harvest'}
                      disabled={snapshot.protocol.pausedHarvest || snapshot.network === 'wrong'}
                      iconRight={<ArrowUpRight size={16} weight="bold" aria-hidden="true" />}
                    >
                      Harvest yield
                    </Button>
                  ) : null}
                  <ButtonLink to="/app/borrow" variant="secondary">
                    Mint qINJ
                  </ButtonLink>
                  <ButtonLink to="/app/confluence" variant="secondary">
                    Redeem qINJ
                  </ButtonLink>
                  {snapshot.position.debtQinj === 0n ? (
                    <ButtonLink to="/app/basin" variant="secondary">
                      Withdraw
                    </ButtonLink>
                  ) : null}
                </div>
              </div>
            </div>

            <aside className="overview-grid__side">
              <Panel className="side-panel" meta="Confluence" title="Exit liquidity">
                <BufferGauge
                  bufferLst={snapshot.protocol.bufferLst}
                  targetLst={snapshot.protocol.bufferTargetLst}
                  queuedLst={snapshot.protocol.queuedLst}
                  compact
                />
                <p className="side-panel__note">
                  Redemptions pay stINJ, not INJ. Worst case is {snapshot.config.redemptionDelayDays}{' '}
                  days if the buffer is empty.
                </p>
                <Link to="/app/confluence" className="text-link">
                  Open Confluence
                  <ArrowRight size={14} weight="bold" aria-hidden="true" />
                </Link>
              </Panel>

              <Panel className="side-panel" meta="Rate" title="Oracle reading">
                <div className="rate-readout">
                  <div>
                    <span>Exchange rate</span>
                    <strong>{formatRate(snapshot.rate.value)}</strong>
                    <small>INJ per stINJ</small>
                  </div>
                  <div>
                    <span>Assumed APR</span>
                    <strong>{formatPct(snapshot.rate.aprBps)}</strong>
                    <small>scenario input</small>
                  </div>
                </div>
                <div className="rate-readout__foot">
                  <span>Updated {formatDateShort(snapshot.rate.updatedAt)}</span>
                  <span>Stale after {snapshot.config.staleAfterDays}d</span>
                </div>
              </Panel>

              <Panel
                className="side-panel"
                meta="Ledger"
                title="Recent activity"
                action={
                  <Link to="/app/activity" className="panel__hint">
                    All
                  </Link>
                }
              >
                {snapshot.events.length === 0 ? (
                  <p className="side-panel__note">No events yet. Your first deposit will appear here.</p>
                ) : (
                  <ul className="mini-ledger">
                    {snapshot.events.slice(-5).reverse().map((event) => (
                      <li key={event.id} className="mini-ledger__item">
                        <span className={`mini-ledger__icon mini-ledger__icon--${event.status}`}>
                          {event.status === 'confirmed' ? (
                            <CheckCircle size={14} weight="fill" aria-hidden="true" />
                          ) : (
                            <Warning size={14} weight="fill" aria-hidden="true" />
                          )}
                        </span>
                        <div>
                          <strong>{event.title}</strong>
                          <span>{formatDateShort(event.at)}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>
            </aside>
          </div>
        </>
      ) : (
        <>
          <EmptyPosition />
          <div className="empty-stats">
            <Stat
              label="Simulated wallet"
              value={formatAmount(snapshot.position.walletLst, 2)}
              unit="stINJ"
              note="Demo balance. No real funds."
            />
            <Stat
              label="Exchange rate"
              value={formatRate(snapshot.rate.value)}
              unit="INJ/stINJ"
              note={`${formatPct(snapshot.rate.aprBps)} APR assumption`}
            />
            <Stat
              label="Confluence buffer"
              value={formatAmount(snapshot.protocol.bufferLst, 0)}
              unit="stINJ"
              note={`${formatAmount(snapshot.protocol.queuedLst, 0)} queued`}
            />
          </div>
        </>
      )}
    </div>
  );
}