import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Wallet } from '@phosphor-icons/react';
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
      <main className="gate gate--zl" id="main">
        <header className="gate__top">
          <Wordmark to="/" />
          <div className="gate__top-actions">
            <SimulatedBadge />
            <ThemeToggle />
          </div>
        </header>

        <div className="gate-zl">
          <section className="card gate-card" aria-labelledby="connect-title">
            <div className="gate__bar" aria-hidden="true">
              <span>Quench</span>
              <span className="gate__bar-crumbs"><span>Loans</span></span>
              <span className="gate__bar-net">testnet 1439</span>
            </div>
            <div className="gate__ruler" aria-hidden="true" />
            <div className="gate__body">
            <h2 className="loan-head">Loan</h2>
            <div>
              <span className="field-label">Collateral</span>
              <div className="token-box" aria-hidden="true">
                <div className="token-box__row">
                  <span className="token-box__num">100</span>
                  <span className="token-pill"><span className="token-ico">◆</span> stINJ</span>
                </div>
                <div className="token-box__sub">
                  <span>100 INJ</span>
                  <span>Balance: 250 Max</span>
                </div>
              </div>
            </div>
            <div>
              <span className="field-label">How much you want to borrow?</span>
              <div className="token-box" aria-hidden="true">
                <div className="token-box__row">
                  <span className="token-box__num">50</span>
                  <span className="token-pill"><span className="token-ico">Q</span> qINJ</span>
                </div>
                <div className="token-box__sub">
                  <span>50 INJ</span>
                  <span>20% 30% Max</span>
                </div>
              </div>
            </div>

            <div className="gate__panel-head">
              <h2 id="connect-title">
                {testnet ? 'Contracts are not wired in this change.' : 'Open the instrument.'}
              </h2>
              <p>
                {testnet
                  ? 'The testnet client is a stub. Build with VITE_QUENCH_MODE=simulated to use the full demo.'
                  : 'Creates a local simulated account. No wallet extension, no network.'}
              </p>
            </div>

            {error ? (
              <Banner tone="danger" title="Connection failed">
                {error}
              </Banner>
            ) : null}

            {testnet ? (
              <div className="gate__actions">
                <ButtonLink to="/" variant="secondary" size="lg">
                  Back to the story
                </ButtonLink>
              </div>
            ) : (
              <div className="gate__actions">
                <Button
                  size="lg"
                  full
                  loading={busy}
                  onClick={connect}
                  data-testid="connect-button"
                  iconRight={<Wallet size={18} weight="bold" aria-hidden="true" />}
                >
                  Connect simulated wallet
                </Button>
                <Link to="/" className="text-link">
                  Back to the story
                </Link>
              </div>
            )}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
