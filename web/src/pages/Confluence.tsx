import { useState } from 'react';
import { ArrowDown } from '@phosphor-icons/react';
import { useQuench, ONE } from '../client';
import { bpsOf, formatAmount, formatDateTime, formatPct, mulDiv, parseTokenInput } from '../client/math';
import { useAction } from '../lib/useAction';
import { Banner } from '../components/Banner';
import { Button, ButtonLink } from '../components/Button';
import { InstrumentBar } from '../components/InstrumentBar';
import { StateBanner } from '../components/StateBanner';

export default function Confluence() {
  const { client, snapshot } = useQuench();
  const { busy, error, run } = useAction();
  const [input, setInput] = useState('');
  const amount = parseTokenInput(input);
  const fee = bpsOf(amount, snapshot.config.redeemFeeBps);
  const net = amount - fee;
  const lstOut = mulDiv(net, ONE, snapshot.rate.value);
  const willQueue = snapshot.protocol.bufferLst < lstOut;
  const canRedeem =
    snapshot.network === 'testnet' &&
    amount > 0n &&
    amount <= snapshot.position.qinjBalance;
  const redeemError =
    amount > 0n && amount > snapshot.position.qinjBalance
      ? `Exceeds wallet (${formatAmount(snapshot.position.qinjBalance, 2)} qINJ).`
      : undefined;

  const redeem = async () => {
    await run('redeem', async () => {
      await client.redeem(amount);
      setInput('');
    });
  };

  return (
    <div className="page-simple page-simple--narrow">
      <StateBanner />
      {error ? (
        <Banner tone="danger" title="Redemption failed">
          {error}
        </Banner>
      ) : null}

      {snapshot.protocol.queuedLst > 0n ? (
        <Banner tone="warn" title="Redemption queue is active">
          {formatAmount(snapshot.protocol.queuedLst, 2)} stINJ queued.
        </Banner>
      ) : null}

      <section className="card" aria-label="Swap">
        <InstrumentBar crumb="Swap" chainId={snapshot.chainId} />
        <h2 className="loan-head">Swap</h2>
        {snapshot.position.qinjBalance === 0n ? (
          <div className="swap-empty">
            <p className="swap-empty__title">Nothing to redeem</p>
            <p className="muted">Borrow qINJ first.</p>
            <ButtonLink to="/app/loans" full size="lg">
              Borrow qINJ
            </ButtonLink>
          </div>
        ) : (
          <>
            <div>
              <span className="field-label">Amount to swap</span>
              <div className={`token-box amount-field__control${redeemError ? ' amount-field--error' : ''}`}>
                <div className="token-box__row">
                  <input
                    id="redeem-amount"
                    className="amount-field__input"
                    inputMode="decimal"
                    autoComplete="off"
                    spellCheck={false}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="0.00"
                    aria-label="Amount to swap"
                    aria-invalid={redeemError ? true : undefined}
                    data-testid="redeem-input"
                  />
                  <span className="token-pill">
                    <span className="token-ico" aria-hidden="true">Q</span> qINJ
                  </span>
                </div>
                <div className="token-box__sub">
                  <span>Balance {formatAmount(snapshot.position.qinjBalance, 2)}</span>
                  <button type="button" className="chip" onClick={() => setInput(formatAmount(snapshot.position.qinjBalance, 18))}>
                    Max
                  </button>
                </div>
                {redeemError ? (
                  <div className="amount-field__help amount-field__help--error" role="alert">{redeemError}</div>
                ) : null}
              </div>
            </div>

            <div className="swap-arrow" aria-hidden="true">
              <ArrowDown size={14} aria-hidden="true" />
            </div>

            <span className="field-label">You receive</span>
            <div className={`token-box${amount > 0n ? ' token-box--out' : ''}`}>
              <div className="token-box__row">
                <span className="token-box__num">{formatAmount(lstOut, 4)}</span>
                <span className="token-pill">
                  <span className="token-ico" aria-hidden="true">◆</span> stINJ
                </span>
              </div>
              <div className="token-box__sub">
                <span>
                  {amount > 0n
                    ? `Fee ${formatAmount(fee, 2)} qINJ`
                    : `Fee ${formatPct(snapshot.config.redeemFeeBps)}`}
                </span>
                <span>Buffer {formatAmount(snapshot.protocol.bufferLst, 0)} stINJ</span>
              </div>
            </div>

            {amount === 0n ? (
              <p className="info-bar">
                Redeem qINJ for stINJ. Paid from the buffer, or queued for about{' '}
                {snapshot.config.redemptionDelayDays} days. You can also sell qINJ on a DEX.
              </p>
            ) : willQueue ? null : (
              <p className="info-bar">
                Buffer covers this redemption. stINJ pays on confirm.
              </p>
            )}

            {willQueue && amount > 0n ? (
              <Banner tone="warn" title="This redemption will queue" compact>
                Buffer is short. Redemption takes about {snapshot.config.redemptionDelayDays} days.
              </Banner>
            ) : null}

            <Button
              full
              size="lg"
              onClick={redeem}
              loading={busy === 'redeem'}
              disabled={!canRedeem}
              data-testid="redeem-submit"
              iconRight={false}
            >
              Redeem qINJ
            </Button>
          </>
        )}
      </section>

      {snapshot.redemptions.length > 0 ? (
        <section className="card" aria-label="Redemptions">
          <InstrumentBar crumb="Swap / redemptions" chainId={snapshot.chainId} />
          <h2>Redemptions</h2>
          <ul className="simple-list">
            {snapshot.redemptions.map((redemption) => (
              <li key={redemption.id}>
                <span>
                  {redemption.status === 'paid' ? 'Paid' : 'Queued'} · {formatAmount(redemption.lst, 4)} stINJ
                </span>
                <span className="muted-inline">{formatDateTime(redemption.requestedAt)}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
