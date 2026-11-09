import { useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { ArrowDown, ArrowUpRight, ShieldWarning } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import { useSources } from '../components/SourcesDrawer';
import { ButtonLink } from '../components/Button';
import { BufferGauge } from '../components/BufferGauge';
import { LiquidType } from '../components/LiquidType';
import { LoopDiagram } from '../components/LoopDiagram';
import { PressureCurve } from '../components/PressureCurve';
import { SimulatedBadge } from '../components/SimulatedBadge';
import { ThemeToggle } from '../components/ThemeToggle';
import { Wordmark } from '../components/Wordmark';
import { PROTOCOL_CONFIG } from '../client';
import { monthsToZero, projectCurve } from '../domain/curve';

const LOOP_STATEMENT =
  'Deposit stINJ. Mint qINJ. Staking yield burns the loan down. Redeem in LST; withdraw at zero debt.';

const HERO_CURVE = projectCurve({
  collateralInj: 150,
  debtInj: 50,
  aprBps: PROTOCOL_CONFIG.aprBps,
  maxLtvBps: PROTOCOL_CONFIG.maxLtvBps,
  months: 120,
});

const HERO_FACTS = [
  { label: 'Max LTV', value: '50%' },
  { label: 'Mint fee', value: '0.50%' },
  { label: 'Redeem fee', value: '0.50%' },
  { label: 'Worst exit', value: '≤ 7 days' },
  { label: 'Payout', value: 'stINJ' },
];

function SectionHead({
  index,
  kicker,
  title,
  id,
  lede,
  inverse = false,
  children,
}: {
  index: string;
  kicker: string;
  title: ReactNode;
  id: string;
  lede: string;
  inverse?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className={`section__head section__head--index${inverse ? ' section__head--inv' : ''}`}>
      <span className="section__index" aria-hidden="true">
        {index}
      </span>
      <div className="section__head-main">
        <div className={`kicker${inverse ? ' kicker--inv' : ''}`}>{kicker}</div>
        <h2 className="section__title" id={id}>
          {title}
        </h2>
        {children}
      </div>
      <p className="section__lede">{lede}</p>
    </div>
  );
}

export default function Landing() {
  const openSources = useSources();
  const [ltv, setLtv] = useState(50);
  const [apr, setApr] = useState(7.53);

  const labCurve = useMemo(
    () =>
      projectCurve({
        collateralInj: 100,
        debtInj: ltv,
        aprBps: apr * 100,
        maxLtvBps: PROTOCOL_CONFIG.maxLtvBps,
        months: 300,
      }),
    [ltv, apr],
  );
  const months = useMemo(
    () =>
      monthsToZero({
        collateralInj: 100,
        debtInj: ltv,
        aprBps: apr * 100,
        maxLtvBps: PROTOCOL_CONFIG.maxLtvBps,
      }),
    [ltv, apr],
  );

  const ltvFill = ((ltv - 20) / 30) * 100;
  const aprFill = ((apr - 3) / 9) * 100;

  return (
    <div className="landing">
      <header className="site-header">
        <div className="site-header__inner">
          <Wordmark to="/" />
          <nav className="site-nav" aria-label="Landing sections">
            <a href="#loop">The loop</a>
            <a href="#curve">The curve</a>
            <a href="#exits">Exits</a>
            <a href="#risk">Risk</a>
            <button type="button" onClick={openSources}>
              Sources
            </button>
          </nav>
          <div className="site-header__actions">
            <ThemeToggle />
            <ButtonLink to="/app" size="sm">
              Open the instrument
            </ButtonLink>
          </div>
        </div>
      </header>

      <main>
        <section className="hero" id="top" aria-labelledby="hero-title">
          <div className="hero__wrap">
            <div className="hero__copy">
              <div className="hero__meta">
                <span className="kicker hero__kicker">Self-repaying loans · Injective EVM</span>
                <span className="hero__folio" aria-hidden="true">
                  Q / 01
                </span>
              </div>
              <h1 className="hero__title" id="hero-title" data-enter>
                Borrow against <em>stINJ</em>.
              </h1>
              <p className="hero__loop" data-testid="hero-loop" data-enter>
                {LOOP_STATEMENT}
              </p>
              <p className="hero__lede" data-enter>
                Your staking yield burns the debt down. Your collateral keeps earning. Every
                consequence is on screen before you act.
              </p>
              <div className="hero__actions" data-enter>
                <ButtonLink to="/app" size="lg">
                  Open the instrument
                </ButtonLink>
                <a className="text-link" href="#risk">
                  Read the risk first
                  <ArrowDown size={14} weight="bold" aria-hidden="true" />
                </a>
              </div>
              <div className="hero__fineprint" data-enter>
                <SimulatedBadge />
                <span>No wallet. No keys. No real funds.</span>
              </div>
            </div>

            <div className="hero__frame" data-enter>
              <div className="frame__bar">
                <span className="frame__app">Quench</span>
                <span className="frame__crumb">Basin / 01</span>
                <span className="frame__net">testnet 1439</span>
              </div>
              <div className="frame__ruler" aria-hidden="true" />
              <div className="frame__body">
                <div className="frame__head">
                  <div>
                    <span className="frame__eyebrow">Position / simulated</span>
                    <div className="frame__title">The debt is cooling.</div>
                  </div>
                  <span className="frame__status">Rate fresh</span>
                </div>

                <div className="frame__readout">
                  <span>Debt</span>
                  <strong>50.00 → 0.00 qINJ</strong>
                  <em>46 mo at 7.53% APR</em>
                </div>

                <div className="frame__ltv">
                  <div className="frame__ltv-top">
                    <span>Loan to value</span>
                    <strong>33.3%</strong>
                    <em>max 50.0%</em>
                  </div>
                  <div className="frame__ltv-track" aria-hidden="true">
                    <span style={{ width: '66.6%' }} />
                    <i />
                  </div>
                </div>

                <div className="frame__grid">
                  <div className="frame__stats">
                    <div className="frame__stat">
                      <span>Collateral</span>
                      <strong>150.00 stINJ</strong>
                      <em>INJ value 150.00</em>
                    </div>
                    <div className="frame__stat">
                      <span>Headroom</span>
                      <strong>25.00 INJ</strong>
                      <em>to max LTV</em>
                    </div>
                    <div className="frame__stat">
                      <span>Yield</span>
                      <strong>7.53% APR</strong>
                      <em>assumption</em>
                    </div>
                  </div>
                  <div className="frame__chart">
                    <div className="frame__chart-head">
                      <span>Debt / max LTV</span>
                      <span>50% boundary</span>
                    </div>
                    <PressureCurve
                      points={HERO_CURVE}
                      currentMonth={0}
                      compact
                      showCollateral={false}
                      ariaLabel="Illustrative scenario: 50 qINJ debt falling toward zero beneath the 50% max LTV boundary"
                    />
                  </div>
                </div>

                <div className="frame__foot">
                  <div className="frame__next">
                    <span>Scenario</span>
                    <strong>1 stINJ = 1 INJ</strong>
                  </div>
                  <div className="frame__actions">
                    <Link to="/app" className="frame__button">
                      Open
                    </Link>
                    <a href="#curve" className="frame__button frame__button--ghost">
                      The curve
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <dl className="hero__facts" aria-label="Demo parameters">
              {HERO_FACTS.map((fact) => (
                <div className="hero__fact" key={fact.label}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
              <div className="hero__fact hero__fact--source">
                <dt>Assumptions</dt>
                <dd>
                  <button type="button" className="text-link" onClick={openSources}>
                    Sources
                    <ArrowUpRight size={13} weight="bold" aria-hidden="true" />
                  </button>
                </dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="section section--loop" id="loop" aria-labelledby="loop-title">
          <div className="wrap">
            <SectionHead
              index="02"
              kicker="The loop"
              title="The yield pays the loan."
              id="loop-title"
              lede="Four steps, one circuit. The readings below are the same ones the app shows, not decorative stats."
            />
            <LoopDiagram />
          </div>
        </section>

        <section className="section section--curve" id="curve" aria-labelledby="curve-title">
          <div className="wrap curve-lab">
            <SectionHead
              index="03"
              kicker="The curve"
              title="The curve is the product."
              id="curve-title"
              lede="A self-repaying loan is not a rate table. It is a debt curve with a coolant loop. Change the two assumptions that matter and watch the zero-debt date move."
              inverse
            />

            <div className="curve-lab__body">
              <div className="curve-lab__copy">
                <div className="lab-readout" aria-live="polite">
                  <div className="lab-readout__value">
                    {months === null ? (
                      '50y+'
                    ) : months === 0 ? (
                      'now'
                    ) : (
                      <>
                        {months}
                        <small>mo</small>
                      </>
                    )}
                  </div>
                  <div>
                    <div className="lab-readout__label">to zero debt / scenario only</div>
                    <div className="lab-readout__note">
                      100 INJ collateral. 0.50% mint fee. Assumes the rate holds and the wallet keeps
                      qINJ available for Wellspring to burn.
                    </div>
                  </div>
                </div>

                <div className="lab-controls">
                  <label className="lab-control" htmlFor="lab-ltv">
                    <span className="lab-control__top">
                      <span>Debt / collateral</span>
                      <strong>{ltv.toFixed(0)}% LTV</strong>
                    </span>
                    <input
                      id="lab-ltv"
                      type="range"
                      min="20"
                      max="50"
                      step="1"
                      value={ltv}
                      style={{ '--fill': `${ltvFill}%` } as CSSProperties}
                      onChange={(event) => setLtv(Number(event.target.value))}
                    />
                    <span className="lab-control__scale" aria-hidden="true">
                      <span>20%</span>
                      <span>50%</span>
                    </span>
                    <span className="lab-control__hint">Max LTV is 50% in this demo.</span>
                  </label>
                  <label className="lab-control" htmlFor="lab-apr">
                    <span className="lab-control__top">
                      <span>Staking APR assumption</span>
                      <strong>{apr.toFixed(2)}%</strong>
                    </span>
                    <input
                      id="lab-apr"
                      type="range"
                      min="3"
                      max="12"
                      step="0.01"
                      value={apr}
                      style={{ '--fill': `${aprFill}%` } as CSSProperties}
                      onChange={(event) => setApr(Number(event.target.value))}
                    />
                    <span className="lab-control__scale" aria-hidden="true">
                      <span>3%</span>
                      <span>12%</span>
                    </span>
                    <span className="lab-control__hint">
                      Default 7.53% APY, fetched 9 Nov 2026 from Staking Rewards.
                    </span>
                  </label>
                </div>
              </div>

              <div className="curve-lab__chart">
                <div className="chart-stage">
                  <div className="chart-stage__head">
                    <span>Scenario / 100 INJ collateral</span>
                    <span>
                      {ltv}% LTV · {apr.toFixed(2)}% APR
                    </span>
                  </div>
                  <PressureCurve
                    points={labCurve}
                    currentMonth={0}
                    eyebrow="Debt pressure"
                    ariaLabel={`Projected debt curve for ${ltv}% LTV and ${apr.toFixed(2)}% APR`}
                  />
                  <div className="chart-stage__foot">
                    <span>Not a forecast. The APR is a scenario assumption, not a live quote.</span>
                    <button type="button" className="text-link" onClick={openSources}>
                      Sources
                      <ArrowUpRight size={14} weight="bold" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section section--exits" id="exits" aria-labelledby="exits-title">
          <div className="wrap">
            <SectionHead
              index="04"
              kicker="Confluence"
              title="Exits don’t wait for 21 days."
              id="exits-title"
              lede="Confluence pays qINJ redemptions in stINJ units from a buffer. If the buffer is empty, the request queues; worst case is the configured delay. It never waits on Injective’s 21-day unbonding."
            />

            <div className="exit-stage">
              <div className="exit-figure exit-figure--old">
                <span className="exit-figure__label">Protocol unbonding</span>
                <strong>
                  21<span>days</span>
                </strong>
                <p>The route Quench does not use.</p>
              </div>
              <div className="exit-figure exit-figure--new">
                <span className="exit-figure__label">Confluence worst case</span>
                <strong>
                  ≤7<span>days</span>
                </strong>
                <p>Configured delay. Buffer first.</p>
              </div>
            </div>

            <div className="exit-path">
              <div className="exit-path__flow" aria-label="Confluence redemption flow">
                <div className="exit-path__node">
                  <span>You hold</span>
                  <strong>qINJ</strong>
                </div>
                <span className="exit-path__arrow" aria-hidden="true">
                  →
                </span>
                <div className="exit-path__node exit-path__node--accent">
                  <span>Confluence</span>
                  <strong>buffer</strong>
                </div>
                <span className="exit-path__arrow" aria-hidden="true">
                  →
                </span>
                <div className="exit-path__node">
                  <span>You receive</span>
                  <strong>stINJ</strong>
                </div>
              </div>

              <div className="exit-path__gauge">
                <BufferGauge
                  bufferLst={PROTOCOL_CONFIG.initialBufferLst}
                  targetLst={PROTOCOL_CONFIG.bufferTargetLst}
                  queuedLst={0n}
                  compact
                />
              </div>
            </div>

            <div className="exit-foot">
              <p className="exit-note">
                Payout is in <strong>stINJ</strong>, not INJ. If you want INJ, you still need a
                liquid venue. That dependency is not hidden.
              </p>
              <p className="exit-buffer-note">
                <ShieldWarning size={16} weight="regular" aria-hidden="true" />
                <span>
                  Buffer empty? The request queues and stays visible. No pause can disable
                  redemption.
                </span>
              </p>
            </div>
          </div>
        </section>

        <section className="section section--moment" aria-labelledby="moment-title">
          <div className="wrap">
            <div className="moment__meta">
              <span>Debt, in one direction</span>
              <span>Wellspring / 05</span>
            </div>
            <LiquidType
              id="moment-title"
              lines={['Debt falls.', 'Collateral rises.']}
              className="moment__statement"
            />
            <div className="moment__foot">
              <p className="moment__sub">
                No interest accrues. Wellspring burns qINJ from your wallet against the debt you
                owe, while the collateral keeps earning.
              </p>
              <p className="moment__note">
                The loop has one direction
                <br />
                until debt reaches zero.
              </p>
            </div>
          </div>
        </section>

        <section className="section section--risk" id="risk" aria-labelledby="risk-title">
          <div className="wrap">
            <SectionHead
              index="06"
              kicker="Risk"
              title="Pressure has a release valve."
              id="risk-title"
              lede="Quench is not “safe”. It is legible. Every risk state names the cause, the raw value and the exit that stays open."
              inverse
            />

            <div className="risk-table">
              <div className="risk-table__head" aria-hidden="true">
                <span>No.</span>
                <span>State</span>
                <span>Cause and consequence</span>
                <span>Exit that stays open</span>
              </div>
              <div className="risk-row">
                <span className="risk-row__index">01</span>
                <div className="risk-row__state">
                  <span className="risk-dot risk-dot--warn" aria-hidden="true" />
                  Rate stale
                </div>
                <p>Mints and harvest pause when the last rate update is older than seven days.</p>
                <span className="risk-row__exit">Redeem · withdraw at zero debt</span>
              </div>
              <div className="risk-row">
                <span className="risk-row__index">02</span>
                <div className="risk-row__state">
                  <span className="risk-dot risk-dot--warn" aria-hidden="true" />
                  Rate out of bounds
                </div>
                <p>The exchange rate leaves the configured band. Entries pause; exits do not.</p>
                <span className="risk-row__exit">Redeem · withdraw at zero debt</span>
              </div>
              <div className="risk-row">
                <span className="risk-row__index">03</span>
                <div className="risk-row__state">
                  <span className="risk-dot risk-dot--danger" aria-hidden="true" />
                  Rate drop
                </div>
                <p>
                  Collateral value falls. If debt crosses max LTV, the position is
                  liquidation-eligible and the shortfall is shown, not hidden.
                </p>
                <span className="risk-row__exit">Redeem · liquidation path</span>
              </div>
              <div className="risk-table__foot">
                <span>Entries can pause. Redemption and withdrawal at zero debt cannot.</span>
                <span>Raw values, always.</span>
              </div>
            </div>

            <div className="risk-statement">
              <p>Exits are never paused.</p>
              <div className="risk-footer">
                <div>
                  <strong>No admin mint.</strong> No path creates unbacked qINJ. Admin actions are
                  timelocked in the protocol design.
                </div>
                <div>
                  <strong>No “Safe ✓”.</strong> Raw values and consequences, always.
                </div>
                <Link className="text-link" to="/app">
                  See the states in the app
                  <ArrowUpRight size={14} weight="bold" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <footer className="closing" aria-labelledby="close-title">
          <div className="wrap">
            <div className="close__grid">
              <div>
                <div className="kicker">The demo</div>
                <h2 className="close__title" id="close-title">
                  Open the instrument.
                </h2>
                <p className="close__lede">
                  One Basin, one LST, one synthetic. Every flow works; the wallet, RPC and contracts
                  are simulated. The protocol build is paused, and the UI says so.
                </p>
              </div>
              <div className="close__actions">
                <ButtonLink to="/app" size="lg">
                  Open the instrument
                </ButtonLink>
                <button type="button" className="text-link" onClick={openSources}>
                  Read the sources
                  <ArrowUpRight size={14} weight="bold" aria-hidden="true" />
                </button>
                <SimulatedBadge />
              </div>
            </div>

            <div className="close__mark" aria-hidden="true">
              quench
            </div>

            <div className="site-footer">
              <div className="site-footer__inner">
                <div>
                  <Wordmark to="/" inverse />
                  <p className="site-footer__note">
                    A clean-room demo. No Alchemix code, visuals or copy. No audit. No mainnet. No
                    real funds.
                  </p>
                </div>
                <div className="site-footer__links">
                  <a
                    href="https://docs.injective.network/developers-evm/network-information"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Injective EVM docs
                  </a>
                  <a
                    href="https://stakingrewards.com/asset/injective-protocol"
                    target="_blank"
                    rel="noreferrer"
                  >
                    INJ staking APR
                  </a>
                  <button type="button" className="text-link" onClick={openSources}>
                    Sources &amp; assumptions
                  </button>
                </div>
              </div>
              <div className="site-footer__legal">
                <SimulatedBadge />
                <span>Quench · testnet-only · 2026</span>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
