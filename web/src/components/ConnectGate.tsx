import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, LockKey, Wallet } from '@phosphor-icons/react';
import { useQuench } from '../client';
import { Banner } from './Banner';
import { Button, ButtonLink } from './Button';
import { SimulatedBadge } from './SimulatedBadge';
import { ThemeToggle } from './ThemeToggle';
import { Wordmark } from './Wordmark';

export function ConnectGate() {
  const { client, snapshot } = useQuench();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const testnet = snapshot.mode === 'testnet';

  const connect = async () => {
    setBusy(true);
    setError(null);
    try {
      await client.connect();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not connect the simulated wallet.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <main className="gate" id="main">
        <header className="gate__top">
          <Wordmark to="/" />
          <div className="gate__top-actions">
            <SimulatedBadge />
            <ThemeToggle />
          </div>
        </header>

        <div className="gate__grid">
          <div className="gate__copy">
            <div className="kicker">Self-repaying loans · Injective EVM</div>
            <h1 className="gate__title">
              A loan that
              <br />
              cools itself.
            </h1>
            <p className="gate__lede">
              Deposit stINJ. Mint qINJ. Let staking yield burn the debt down. Redeem in LST units;
              withdraw when debt is zero.
            </p>
            <div className="gate__rules">
              <div>
                <span>01</span>
                <p>No extension. No keys. No real funds.</p>
              </div>
              <div>
                <span>02</span>
                <p>Every screen is simulated until the contracts are wired.</p>
              </div>
              <div>
                <span>03</span>
                <p>Exits stay open when mints and harvest pause.</p>
              </div>
            </div>
          </div>

          <section className="gate__panel" aria-labelledby="connect-title">
            <div className="gate__instrument" aria-hidden="true">
              <div className="gate__instrument-top">
                <span>Sample position / simulated</span>
                <span>Basin 01</span>
              </div>
              <div className="gate__readout">
                <strong>150.00</strong>
                <span>stINJ collateral</span>
              </div>
              <div className="gate__instrument-label">
                <span>Collateral value</span>
                <strong>150.00 INJ</strong>
              </div>
              <div className="gate__instrument-bar">
                <span style={{ width: '100%' }} />
              </div>
              <div className="gate__instrument-label">
                <span>Loan to value</span>
                <strong>33.3% / 50% max</strong>
              </div>
              <div className="gate__instrument-bar">
                <span style={{ width: '66.6%' }} />
              </div>
              <div className="gate__instrument-label">
                <span>Confluence buffer</span>
                <strong>500 / 750 stINJ</strong>
              </div>
              <div className="gate__instrument-bar gate__instrument-bar--accent">
                <span style={{ width: '66.6%' }} />
              </div>
            </div>

            <div className="gate__panel-head">
              <div className="kicker">{testnet ? 'Testnet mode' : 'Simulated wallet'}</div>
              <h2 id="connect-title">
                {testnet ? 'Contracts are not wired in this change.' : 'Open the instrument.'}
              </h2>
              <p>
                {testnet
                  ? 'The testnet client is a stub. It invents no address and no ABI. Build with VITE_QUENCH_MODE=simulated to use the full demo.'
                  : 'This connect button creates a local simulated account. It does not open a wallet extension, sign a message or touch a network.'}
              </p>
            </div>

            {error ? (
              <Banner tone="danger" title="Connection failed">
                {error}
              </Banner>
            ) : null}

            {testnet ? (
              <div className="gate__actions">
                <ButtonLink
                  to="/"
                  variant="secondary"
                  size="lg"
                  iconRight={<ArrowLeft size={16} weight="bold" />}
                >
                  Back to the story
                </ButtonLink>
              </div>
            ) : (
              <div className="gate__actions">
                <Button
                  size="lg"
                  loading={busy}
                  onClick={connect}
                  data-testid="connect-button"
                  iconRight={<Wallet size={18} weight="bold" aria-hidden="true" />}
                >
                  Connect simulated wallet
                </Button>
                <Link to="/" className="text-link">
                  <ArrowLeft size={14} weight="bold" aria-hidden="true" />
                  Back to the story
                </Link>
              </div>
            )}

            <div className="gate__safety">
              <LockKey size={16} weight="bold" aria-hidden="true" />
              <span>No seed phrase. No private key. No funds. Nothing leaves this browser.</span>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
