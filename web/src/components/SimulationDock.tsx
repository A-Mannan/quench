import { useState } from 'react';
import {
  ArrowCounterClockwise,
  ArrowClockwise,
  FastForward,
  Flask,
  SlidersHorizontal,
  Warning,
} from '@phosphor-icons/react';
import { useQuench } from '../client';
import type { TxOutcome } from '../client';
import { formatDateTime } from '../client/math';
import { Drawer } from './Drawer';
import { Button } from './Button';

export function SimulationDock() {
  const { client, snapshot } = useQuench();
  const simulation = client.simulation;
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!simulation) return null;

  const run = async (key: string, action: () => Promise<void>) => {
    setBusy(key);
    setError(null);
    try {
      await action();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Simulation control failed.');
    } finally {
      setBusy(null);
    }
  };

  const outcome = snapshot.simulation?.nextOutcome ?? 'success';
  const wrong = snapshot.network === 'wrong';
  const eligible = snapshot.protocol.liquidationEligible;

  return (
    <>
      <button
        type="button"
        className={`sim-trigger${wrong || snapshot.rate.status !== 'fresh' ? ' sim-trigger--alert' : ''}`}
        onClick={() => setOpen(true)}
        data-testid="sim-open"
        aria-haspopup="dialog"
      >
        <Flask size={18} weight="bold" aria-hidden="true" />
        <span>Simulation</span>
        {wrong || snapshot.rate.status !== 'fresh' ? (
          <span className="sim-trigger__dot" aria-label="Simulation state needs attention" />
        ) : null}
      </button>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Simulation controls"
        eyebrow="Local only · never in testnet mode"
        side="bottom"
        testId="sim-drawer"
        footer={
          <div className="sim-footer">
            <span>
              Clock: <strong>{snapshot.simulation ? formatDateTime(snapshot.simulation.now) : '—'}</strong>
            </span>
            <span>
              Rate: <strong>{snapshot.rate.status}</strong>
            </span>
            <span>
              Network: <strong>{wrong ? 'wrong' : 'testnet 1439'}</strong>
            </span>
          </div>
        }
      >
        <p className="drawer__lede">
          These controls change only the simulated client. They do not connect to a wallet, an RPC
          or a contract. Use them to reach every state in the demo.
        </p>

        {error ? (
          <div className="sim-error" role="alert">
            <Warning size={16} weight="bold" aria-hidden="true" /> {error}
          </div>
        ) : null}

        <div className="sim-section">
          <div className="sim-section__head">
            <FastForward size={16} weight="bold" aria-hidden="true" />
            <h3>Advance the clock</h3>
          </div>
          <div className="sim-grid">
            {[
              [30, '30 days'],
              [90, '90 days'],
              [365, '1 year'],
              [1825, '5 years'],
            ].map(([days, label]) => (
              <Button
                key={days}
                variant="secondary"
                size="sm"
                loading={busy === `ff-${days}`}
                onClick={() => run(`ff-${days}`, () => simulation.fastForward(Number(days)))}
                data-testid={`sim-fast-${days}`}
              >
                +{label}
              </Button>
            ))}
          </div>
        </div>

        <div className="sim-section">
          <div className="sim-section__head">
            <SlidersHorizontal size={16} weight="bold" aria-hidden="true" />
            <h3>Force a risk state</h3>
          </div>
          <div className="sim-grid sim-grid--wide">
            <Button
              variant="secondary"
              size="sm"
              loading={busy === 'drop'}
              onClick={() => run('drop', () => simulation.dropRate(1_000))}
              data-testid="sim-drop"
            >
              Rate drop −10%
            </Button>
            <Button
              variant="secondary"
              size="sm"
              loading={busy === 'spike'}
              onClick={() => run('spike', () => simulation.spikeRate(16_000))}
              data-testid="sim-spike"
            >
              Rate spike +160%
            </Button>
            <Button
              variant="secondary"
              size="sm"
              loading={busy === 'stale'}
              onClick={() => run('stale', () => simulation.makeStale())}
              data-testid="sim-stale"
            >
              Make rate stale
            </Button>
            <Button
              variant="secondary"
              size="sm"
              loading={busy === 'drain'}
              onClick={() => run('drain', () => simulation.drainBuffer())}
              data-testid="sim-drain"
            >
              Drain buffer
            </Button>
            <Button
              variant="secondary"
              size="sm"
              loading={busy === 'fund'}
              onClick={() => run('fund', () => simulation.fundBuffer())}
              data-testid="sim-fund"
            >
              Fund buffer
            </Button>
            <Button
              variant="secondary"
              size="sm"
              loading={busy === 'network'}
              onClick={() => run('network', () => simulation.setWrongNetwork(!wrong))}
              data-testid="sim-network"
            >
              {wrong ? 'Restore network' : 'Wrong network'}
            </Button>
          </div>
        </div>

        <div className="sim-section">
          <div className="sim-section__head">
            <ArrowClockwise size={16} weight="bold" aria-hidden="true" />
            <h3>Next transaction</h3>
          </div>
          <div className="segmented" role="group" aria-label="Next simulated transaction outcome">
            {(['success', 'reject', 'fail'] as TxOutcome[]).map((value) => (
              <button
                key={value}
                type="button"
                className={`segmented__item${outcome === value ? ' is-active' : ''}`}
                aria-pressed={outcome === value}
                onClick={() =>
                  run(`outcome-${value}`, async () => {
                    await simulation.setNextOutcome(value);
                    setOpen(false);
                  })
                }
                data-testid={`sim-outcome-${value}`}
              >
                {value}
              </button>
            ))}
          </div>
          <p className="sim-hint">The next state-changing action uses this outcome.</p>
        </div>

        <div className="sim-section">
          <div className="sim-section__head">
            <Warning size={16} weight="bold" aria-hidden="true" />
            <h3>Liquidation path</h3>
          </div>
          <div className="sim-inline">
            <span className="sim-hint">
              {eligible
                ? 'Debt exceeds maxLTV. The position is liquidation-eligible.'
                : 'Only available after a rate drop pushes debt above maxLTV.'}
            </span>
            <Button
              variant="danger"
              size="sm"
              disabled={!eligible}
              loading={busy === 'liquidate'}
              onClick={() => run('liquidate', () => simulation.triggerLiquidation())}
              data-testid="sim-liquidate"
            >
              Trigger liquidation
            </Button>
          </div>
        </div>

        <div className="sim-section sim-section--reset">
          <div className="sim-section__head">
            <ArrowCounterClockwise size={16} weight="bold" aria-hidden="true" />
            <h3>Reset</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            loading={busy === 'reset'}
            onClick={() => run('reset', () => simulation.reset())}
            data-testid="sim-reset"
          >
            Reset demo state
          </Button>
        </div>
      </Drawer>
    </>
  );
}