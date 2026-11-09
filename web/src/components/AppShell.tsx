import { useEffect, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Wallet } from '@phosphor-icons/react';
import { useQuench } from '../client';
import { shortAddress } from '../client/math';
import { Banner } from './Banner';
import { ConnectGate } from './ConnectGate';
import { SimulationDock } from './SimulationDock';
import { ThemeToggle } from './ThemeToggle';
import { useSources } from './SourcesDrawer';
import { TxPanel } from './TxPanel';
import { Wordmark } from './Wordmark';

const NAV = [
  { to: '/app', label: 'Dashboard', end: true },
  { to: '/app/loans', label: 'Loans' },
  { to: '/app/positions', label: 'Positions' },
  { to: '/app/swap', label: 'Swap' },
];

function useHtmlTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    typeof document !== 'undefined' && document.documentElement.dataset.theme === 'light'
      ? 'light'
      : 'dark',
  );
  useEffect(() => {
    const el = document.documentElement;
    const obs = new MutationObserver(() => {
      setTheme(el.dataset.theme === 'light' ? 'light' : 'dark');
    });
    obs.observe(el, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);
  return theme;
}

export function AppShell() {
  const { snapshot } = useQuench();
  const openSources = useSources();
  const wrong = snapshot.network === 'wrong';
  const theme = useHtmlTheme();

  if (typeof document !== 'undefined' && document.documentElement.dataset.theme == null) {
    document.documentElement.dataset.theme = 'dark';
  }

  if (!snapshot.connected) {
    return (
      <>
        <div className={theme === 'light' ? 'app-light app-light--gate' : 'app-dark app-dark--gate'}>
          <ConnectGate />
        </div>
        <TxPanel />
      </>
    );
  }

  return (
    <div className={`app-shell app-shell--simple ${theme === 'light' ? 'app-light' : 'app-dark'}`}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="gas-pill" aria-hidden="true">
        <span>Simulated · Testnet {snapshot.chainId}</span>
      </div>
      <div className="app-body">
        <header className="site-header">
          <div className="site-header__inner">
            <Wordmark to="/" />
            <nav className="site-nav" aria-label="Quench sections">
              {NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => (isActive ? 'is-active' : '')}
                  data-testid={`nav-${item.label.toLowerCase()}`}
                >
                  {item.label}
                </NavLink>
              ))}
              <button type="button" onClick={openSources}>
                Sources
              </button>
            </nav>
            <div className="site-header__actions">
              <span className="net-dot" title={`Injective Testnet ${snapshot.chainId}`} aria-label={`Injective Testnet ${snapshot.chainId}`}>
                <span className="net-dot__icon" aria-hidden="true" />
                testnet {snapshot.chainId}
              </span>
              <button type="button" className="top-link top-link--zl header-sources" onClick={openSources} aria-label="Sources">
                <span>Sources</span>
              </button>
              <ThemeToggle />
              <span className="wallet-pill">
                <Wallet size={14} weight="bold" aria-hidden="true" />
                {shortAddress(snapshot.account.address)}
              </span>
            </div>
          </div>
        </header>

        {wrong ? (
          <div className="app-banner">
            <Banner tone="danger" title="Wrong network">
              Switch back to Injective Testnet 1439 in Simulation.
            </Banner>
          </div>
        ) : null}

        <main className="app-main" id="main">
          <Outlet />
        </main>
      </div>

      <nav className="bottom-nav" aria-label="Quench sections">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `bottom-nav__link${isActive ? ' is-active' : ''}`}
          >
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <TxPanel />
      <SimulationDock />
    </div>
  );
}
