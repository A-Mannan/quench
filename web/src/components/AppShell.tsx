import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  ArrowClockwise,
  ArrowUpRight,
  ChartLineDown,
  Coins,
  Drop,
  Gauge,
  Info,
  ListBullets,
} from '@phosphor-icons/react';
import { useQuench } from '../client';
import { formatAmount, shortAddress } from '../client/math';
import { Banner } from './Banner';
import { ConnectGate } from './ConnectGate';
import { RateStatusPill } from './RateStatusPill';
import { SimulatedBadge } from './SimulatedBadge';
import { SimulationDock } from './SimulationDock';
import { ThemeToggle } from './ThemeToggle';
import { useSources } from './SourcesDrawer';
import { TxPanel } from './TxPanel';
import { Wordmark } from './Wordmark';

const NAV_GROUPS = [
  {
    label: 'Instrument',
    items: [
      { to: '/app', label: 'Overview', icon: Gauge, end: true },
      { to: '/app/basin', label: 'Basin', icon: Drop },
      { to: '/app/borrow', label: 'Borrow', icon: Coins },
    ],
  },
  {
    label: 'Flow',
    items: [
      { to: '/app/wellspring', label: 'Wellspring', icon: ArrowClockwise },
      { to: '/app/confluence', label: 'Confluence', icon: ArrowUpRight },
      { to: '/app/activity', label: 'Activity', icon: ListBullets },
    ],
  },
];

const NAV = NAV_GROUPS.flatMap((group) => group.items);

const TITLES: Record<string, string> = {
  '/app': 'Overview',
  '/app/basin': 'Basin',
  '/app/borrow': 'Borrow',
  '/app/wellspring': 'Wellspring',
  '/app/confluence': 'Confluence',
  '/app/activity': 'Activity',
};

export function AppShell() {
  const { snapshot } = useQuench();
  const location = useLocation();
  const openSources = useSources();
  const title = TITLES[location.pathname] ?? 'Overview';
  const wrong = snapshot.network === 'wrong';

  if (!snapshot.connected) {
    return (
      <>
        <ConnectGate />
        <TxPanel />
      </>
    );
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <aside className="rail" aria-label="Quench sections">
        <div className="rail__brand">
          <Wordmark to="/" />
        </div>
        <nav className="rail__nav" aria-label="Quench sections">
          {NAV_GROUPS.map((group) => (
            <div className="rail__group" key={group.label}>
              <div className="rail__group-label">{group.label}</div>
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) => `rail__link${isActive ? ' is-active' : ''}`}
                    data-testid={`nav-${item.label.toLowerCase()}`}
                  >
                    <Icon size={18} weight="regular" aria-hidden="true" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="rail__position" aria-label="Position summary">
          <div className="rail__position-label">Position</div>
          <div className="rail__position-row">
            <span>Collateral</span>
            <strong>
              {formatAmount(snapshot.position.collateralLst, 2)} <small>stINJ</small>
            </strong>
          </div>
          <div className="rail__position-row">
            <span>Debt</span>
            <strong>
              {formatAmount(snapshot.position.debtQinj, 2)} <small>qINJ</small>
            </strong>
          </div>
          <div className="rail__position-row">
            <span>LTV</span>
            <strong>
              {(snapshot.metrics.ltvBps / 100).toFixed(1)}% <small>of {(snapshot.config.maxLtvBps / 100).toFixed(0)}% max</small>
            </strong>
          </div>
        </div>
        <div className="rail__foot">
          <button type="button" className="rail__utility" onClick={openSources}>
            <Info size={18} weight="regular" aria-hidden="true" />
            <span>Sources</span>
          </button>
          <div className="rail__account">
            <span className="rail__account-dot" aria-hidden="true" />
            <div>
              <strong>Simulated account</strong>
              <span>{shortAddress(snapshot.account.address)}</span>
            </div>
          </div>
        </div>
      </aside>

      <div className="app-body">
        <header className="app-top">
          <div className="app-top__crumb">
            <span>Quench</span>
            <span aria-hidden="true">/</span>
            <strong>{title}</strong>
          </div>
          <div className="app-top__right">
            <span className="network-chip">Testnet {snapshot.chainId}</span>
            <RateStatusPill
              status={snapshot.rate.status}
              rate={`${(Number(snapshot.rate.value) / 1e18).toFixed(3)} INJ/stINJ`}
            />
            <button type="button" className="top-link top-link--sources" onClick={openSources}>
              <ChartLineDown size={16} weight="regular" aria-hidden="true" />
              Sources
            </button>
            <ThemeToggle />
            <SimulatedBadge compact />
          </div>
        </header>

        {wrong ? (
          <div className="app-banner">
            <Banner
              tone="danger"
              title="Wrong network"
              action={
                <span className="banner__hint">
                  Open <strong>Simulation</strong> to switch back to Injective Testnet 1439.
                </span>
              }
            >
              No action will be submitted while the network is wrong. No funds are at risk; this
              is a simulated state.
            </Banner>
          </div>
        ) : null}

        <main className="app-main" id="main">
          <Outlet />
        </main>
      </div>

      <nav className="bottom-nav" aria-label="Quench sections">
        {NAV.slice(0, 5).map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `bottom-nav__link${isActive ? ' is-active' : ''}`}
            >
              <Icon size={20} weight="regular" aria-hidden="true" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <TxPanel />
      <SimulationDock />
    </div>
  );
}