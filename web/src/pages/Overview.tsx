import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowClockwise } from '@phosphor-icons/react';
import { useQuench, DAY_MS } from '../client';
import { formatAmount, formatPct } from '../client/math';
import type { CurvePoint } from '../domain/curve';
import { projectCurve } from '../domain/curve';
import { useAction } from '../lib/useAction';
import { Banner } from '../components/Banner';
import { Button } from '../components/Button';
import { EmptyPosition } from '../components/EmptyPosition';
import { InstrumentBar } from '../components/InstrumentBar';
import { PressureCurve } from '../components/PressureCurve';
import { StateBanner } from '../components/StateBanner';

const MONTH_MS = 30.4375 * DAY_MS;

export default function Overview() {
  const { client, snapshot } = useQuench();
  const { busy, error, run } = useAction();
  const [view, setView] = useState<'mine' | 'protocol'>('mine');
  const [onlyActive, setOnlyActive] = useState(true);
  const hasPosition = snapshot.position.collateralLst > 0n || snapshot.position.debtQinj > 0n;
  const yieldAvailable = snapshot.metrics.yieldSinceHarvestInj;

  const chart = useMemo(() => {
    const history = snapshot.history;
    if (history.length === 0) return { points: [] as CurvePoint[], currentMonth: 0 };
    const first = history[0]?.t ?? 0;
    const actual: CurvePoint[] = history.map((point) => ({
      month: (point.t - first) / MONTH_MS,
      debt: Number(point.debt) / 1e18,
      collateral: Number(point.collateralValue) / 1e18,
      maxDebt: (Number(point.collateralValue) / 1e18) * (snapshot.config.maxLtvBps / 10_000),
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

  const harvest = () => run('harvest', () => client.harvest());
  const ltv = snapshot.metrics.ltvBps;
  const ltvPct = ltv / 100;
  const ltvFill = Math.min(100, (ltv / snapshot.config.maxLtvBps) * 100);

  if (!hasPosition) {
    return (
      <div className="page-simple">
        <div className="simple-head">
          <h1>A clean instrument.</h1>
        </div>
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

  const isActive = snapshot.position.debtQinj > 0n;

  return (
    <div className="page-simple">
      <StateBanner />
      {error ? (
        <Banner tone="danger" title="Action failed">
          {error}
        </Banner>
      ) : null}
      {snapshot.protocol.liquidated ? (
        <Banner tone="danger" title="Position liquidated">
          {formatAmount(snapshot.protocol.badDebtInj, 2)} INJ bad debt (simulated).
        </Banner>
      ) : null}
      {snapshot.position.debtQinj === 0n && snapshot.position.collateralLst > 0n ? (
        <Banner
          tone="success"
          title="Debt is zero"
          action={
            <Link to="/app/basin" className="banner__link">
              Withdraw
            </Link>
          }
        >
          Exit is open.
        </Banner>
      ) : null}
      {snapshot.position.debtQinj > 0n && snapshot.position.qinjBalance === 0n ? (
        <Banner tone="warn" title="No qINJ in wallet">
          Add qINJ back to auto-repay.
        </Banner>
      ) : null}

      <div className="dash-grid">
        <section className="card" aria-label="Loan">
          <InstrumentBar crumb="Loan / 01" chainId={snapshot.chainId} />
          <div className="seg" role="tablist" aria-label="Stats view">
            <button
              type="button"
              role="tab"
              aria-selected={view === 'mine'}
              className={`seg__item${view === 'mine' ? ' is-active' : ''}`}
              onClick={() => setView('mine')}
            >
              My Stats
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={view === 'protocol'}
              className={`seg__item${view === 'protocol' ? ' is-active' : ''}`}
              onClick={() => setView('protocol')}
            >
              Protocol Stats
            </button>
          </div>
          <h2 className="loan-head">Loan</h2>
          {view === 'mine' ? (
            <>
              <div className="loan-field">
                <span className="k">
                  Collateral
                </span>
                <span className="v">{formatAmount(snapshot.position.collateralLst, 2)} stINJ</span>
                <span className="s">Basin position</span>
              </div>
              <div className="loan-field">
                <span className="k">
                  Current debt
                </span>
                <span className="v">{formatAmount(snapshot.position.debtQinj, 2)} qINJ</span>
                <span className="s">1 opened position</span>
              </div>
              <div className="loan-field">
                <span className="k">
                  LTV
                </span>
                <span className="v">
                  {ltvPct.toFixed(1)}% of {formatPct(snapshot.config.maxLtvBps)} max
                </span>
                <span className="s">No liquidation risk</span>
              </div>
              <div className="progress" aria-hidden="true">
                <span style={{ width: `${ltvFill}%` }} />
              </div>
              {yieldAvailable > 0n && isActive ? (
                <div className="loan-actions">
                  <Button
                    onClick={harvest}
                    loading={busy === 'harvest'}
                    disabled={snapshot.protocol.pausedHarvest || snapshot.network === 'wrong'}
                    iconRight={<ArrowClockwise size={16} weight="bold" aria-hidden="true" />}
                  >
                    Harvest {formatAmount(yieldAvailable, 2)} INJ
                  </Button>
                </div>
              ) : null}
            </>
          ) : (
            <>
              <div className="loan-field">
                <span className="k">
                  TVL
                </span>
                <span className="v">{formatAmount(snapshot.metrics.collateralValueInj, 2)} INJ</span>
                <span className="s">Basin collateral</span>
              </div>
              <div className="loan-field">
                <span className="k">
                  Total debt
                </span>
                <span className="v">{formatAmount(snapshot.position.debtQinj, 2)} qINJ</span>
                <span className="s">1 opened position</span>
              </div>
              <div className="loan-field">
                <span className="k">
                  Confluence buffer
                </span>
                <span className="v">{formatAmount(snapshot.protocol.bufferLst, 2)} stINJ</span>
                <span className="s">{formatAmount(snapshot.protocol.queuedLst, 2)} queued</span>
              </div>
            </>
          )}
        </section>

        <section className="card card--chart" aria-label="Statistics">
          <InstrumentBar crumb="Statistics / 01" chainId={snapshot.chainId} />
          <div className="card__head">
            <h2>Statistics</h2>
          </div>
          <PressureCurve
            points={chart.points}
            currentMonth={chart.currentMonth}
            eyebrow="Debt projection"
            ariaLabel="Debt history and projected debt reduction for the current Basin position"
          />
        </section>
      </div>

      <section className="card" aria-label="Your positions">
        <InstrumentBar crumb="Positions / 01" chainId={snapshot.chainId} />
        <div className="card__head">
          <h2>
            Your positions <span className="count-badge" aria-label="1 position">1</span>
          </h2>
          <label className="check">
            <input type="checkbox" checked={onlyActive} onChange={(e) => setOnlyActive(e.target.checked)} />
            Show only Active positions
          </label>
        </div>
        {isActive || !onlyActive ? (
          <div className="pos-row">
            <span className="pos-row__icon" aria-hidden="true">
              Q
            </span>
            <div>
              <div className="pos-row__meta">
                <span>
                  <strong>BASIN</strong> · stINJ
                </span>
                <span>{ltvPct.toFixed(0)}%</span>
              </div>
              <div className={`pos-bar ${snapshot.position.debtQinj === 0n ? 'pos-bar--blue' : 'pos-bar--green'}`}>
                <span style={{ width: `${snapshot.position.debtQinj === 0n ? 100 : ltvFill}%` }} />
              </div>
            </div>
            <span className={`pos-status ${snapshot.position.debtQinj === 0n ? 'pos-status--matured' : 'pos-status--active'}`}>
              <i aria-hidden="true" />
              {snapshot.position.debtQinj === 0n ? 'Matured' : 'Active'}
            </span>
          </div>
        ) : (
          <p className="muted position-none">No active positions.</p>
        )}
        <div className="mini-row">
          <span>qINJ in wallet</span>
          <strong>{formatAmount(snapshot.position.qinjBalance, 2)} qINJ</strong>
        </div>
        <div className="mini-row">
          <span>Buffer</span>
          <strong>{formatAmount(snapshot.protocol.bufferLst, 0)} stINJ</strong>
        </div>
      </section>
    </div>
  );
}
