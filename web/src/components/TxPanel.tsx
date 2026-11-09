import { useEffect, useRef, useState } from 'react';
import { CheckCircle, Warning, X } from '@phosphor-icons/react';
import { useQuench } from '../client';
import { shortHash } from '../client/math';
import { SimulatedBadge } from './SimulatedBadge';

export function TxPanel() {
  const { snapshot } = useQuench();
  const { tx } = snapshot;
  const [open, setOpen] = useState(false);
  const [dismissedKey, setDismissedKey] = useState<string | null>(null);
  const key = tx.kind ? `${tx.kind}:${tx.status}:${tx.hash ?? ''}` : '';

  useEffect(() => {
    if (!tx.kind || tx.status === 'idle') return;
    if (key !== dismissedKey) setOpen(true);
  }, [key, tx.kind, tx.status, dismissedKey]);

  // A settled receipt should not cover the next action. Pause the timer
  // while the panel is hovered or focused so nothing vanishes mid-read.
  const timerRef = useRef(0);
  const armTimer = () => {
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setDismissedKey(key);
      setOpen(false);
    }, 8000);
  };
  useEffect(() => {
    if (!open || tx.status === 'pending' || tx.status === 'idle') return;
    armTimer();
    return () => window.clearTimeout(timerRef.current);
  }, [open, key, tx.status]);

  const pauseTimer = () => window.clearTimeout(timerRef.current);
  const resumeTimer = () => {
    if (open && tx.status !== 'pending' && tx.status !== 'idle') armTimer();
  };

  if (!open || !tx.kind || tx.status === 'idle') return null;

  const tone =
    tx.status === 'confirmed'
      ? 'success'
      : tx.status === 'pending'
        ? 'pending'
        : 'danger';
  const title =
    tx.status === 'pending'
      ? 'Transaction in flight'
      : tx.status === 'confirmed'
        ? 'Confirmed in the simulation'
        : tx.status === 'rejected'
          ? 'Rejected in the simulated wallet'
          : 'Transaction failed';

  const close = () => {
    setDismissedKey(key);
    setOpen(false);
  };

  return (
    <div
      className={`tx-panel tx-panel--${tone}`}
      role="status"
      aria-live="polite"
      data-testid="tx-panel"
      onMouseEnter={pauseTimer}
      onMouseLeave={resumeTimer}
      onFocus={pauseTimer}
      onBlur={resumeTimer}
    >
      <div className="tx-panel__head">
        <div className="tx-panel__status">
          {tx.status === 'pending' ? <span className="tx-panel__spinner" aria-hidden="true" /> : null}
          {tx.status === 'confirmed' ? <CheckCircle size={18} weight="fill" aria-hidden="true" /> : null}
          {tx.status === 'failed' || tx.status === 'rejected' ? (
            <Warning size={18} weight="fill" aria-hidden="true" />
          ) : null}
          <span>{title}</span>
        </div>
        <button type="button" className="icon-button icon-button--small" onClick={close} aria-label="Dismiss transaction">
          <X size={16} weight="bold" aria-hidden="true" />
        </button>
      </div>
      <div className="tx-panel__body">
        <div className="tx-panel__kind">{tx.kind}</div>
        {tx.message ? <p className="tx-panel__message">{tx.message}</p> : null}
        {tx.status === 'pending' ? (
          <p className="tx-panel__message">Waiting for the simulated wallet to respond.</p>
        ) : null}
        {tx.hash ? <div className="tx-panel__hash">tx {shortHash(tx.hash)}</div> : null}
        <div className="tx-panel__foot">
          <SimulatedBadge compact />
          <span>No real network request</span>
        </div>
      </div>
    </div>
  );
}