import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Clock, Info, Warning } from '@phosphor-icons/react';
import { useQuench, ONE } from '../client';
import { bpsOf, formatAmount, formatDateTime, mulDiv, parseTokenInput } from '../client/math';
import { useAction } from '../lib/useAction';
import { AmountField } from '../components/AmountField';
import { Banner } from '../components/Banner';
import { BufferGauge } from '../components/BufferGauge';
import { Button, ButtonLink } from '../components/Button';
import { Consequences } from '../components/Consequences';
import { PageHeader } from '../components/PageHeader';
import { Panel } from '../components/Panel';
import { StateBanner } from '../components/StateBanner';
import { Stat } from '../components/Stat';

export default function Confluence() {
  const { client, snapshot } = useQuench();
  const { busy, error, run } = useAction();
  const [input, setInput] = useState('');
  const amount = parseTokenInput(input);
  const fee = bpsOf(amount, snapshot.config.redeemFeeBps);
  const net = amount - fee;
  const lstOut = mulDiv(net, ONE, snapshot.rate.value);
  const bufferAfter =
    snapshot.protocol.bufferLst > lstOut ? snapshot.protocol.bufferLst - lstOut : 0n;
  const willQueue = snapshot.protocol.bufferLst < lstOut;
  const canRedeem =
    snapshot.network === 'testnet' &&
    amount > 0n &&
    amount <= snapshot.position.qinjBalance;
  const redeemError =
    amount > 0n && amount > snapshot.position.qinjBalance
      ? `Exceeds the wallet balance (${formatAmount(snapshot.position.qinjBalance, 2)} qINJ).`
      : undefined;
  const queue = snapshot.redemptions.filter((redemption) => redemption.status === 'queued');
  const lowBuffer = snapshot.protocol.bufferLst < snapshot.config.bufferTargetLst / 4n;

  const redeem = async () => {
    await run('redeem', async () => {
      await client.redeem(amount);
      setInput('');
    });
  };

  return (
    <div className="page">
      <PageHeader
        kicker="Confluence"
        title="Redeem qINJ for stINJ."
        lede="Confluence pays in LST units, not INJ, and never waits on 21-day unbonding. If the buffer is empty, the request queues with a visible worst case. Redemption stays open when mints and harvest pause."
        aside={
          <div className="page-head__aside-stack">
            <span className="mono page-head__aside-note">
              worst case {snapshot.config.redemptionDelayDays} days
            </span>
            <span className="mono page-head__aside-note">payout asset stINJ</span>
          </div>
        }
      />

      <StateBanner />
      {error ? (
        <Banner tone="danger" title="Redemption failed">
          {error}
        </Banner>
      ) : null}

      {snapshot.protocol.queuedLst > 0n ? (
        <Banner tone="warn" title="Redemption queue is active">
          {formatAmount(snapshot.protocol.queuedLst, 2)} stINJ is queued. Worst case is{' '}
          {snapshot.config.redemptionDelayDays} days while the buffer refills. The action remains
          open; nothing is frozen.
        </Banner>
      ) : null}

      {snapshot.position.qinjBalance === 0n ? (
        <Panel meta="No qINJ" title="Nothing to redeem">
          <div className="empty-inline">
            <div>
              <p>
                This wallet holds no qINJ. Mint qINJ from the Borrow screen first. Redemption is a
                qINJ exit, not a debt repayment; it does not lower your Basin debt.
              </p>
              <ButtonLink to="/app/borrow" size="lg">
                Mint qINJ
              </ButtonLink>
            </div>
            <div className="empty-inline__mark" aria-hidden="true">
              0.00
            </div>
          </div>
        </Panel>
      ) : (
        <div className="confluence-grid">
          <div className="confluence-grid__main">
            <Panel meta="Exit" title="Redeem qINJ">
              <AmountField
                id="redeem-amount"
                label="qINJ to redeem"
                value={input}
                onChange={setInput}
                unit="qINJ"
                maxLabel={`Wallet: ${formatAmount(snapshot.position.qinjBalance, 2)} qINJ`}
                onMax={() => setInput(formatAmount(snapshot.position.qinjBalance, 18))}
                helper="You receive stINJ, not INJ. The worst-case delay is shown before you confirm."
                error={redeemError}
                testId="redeem-input"
              />
              <Consequences
                items={[
                  {
                    label: 'qINJ burned',
                    value: `${formatAmount(amount, 2)} qINJ`,
                  },
                  {
                    label: 'Redeem fee',
                    value: `${formatAmount(fee, 2)} qINJ stays in the buffer`,
                    tone: 'muted',
                  },
                  {
                    label: 'You receive',
                    value: `${formatAmount(lstOut, 4)} stINJ`,
                    tone: 'success',
                  },
                  {
                    label: 'Buffer after',
                    value: willQueue
                      ? 'Queued — buffer is short'
                      : `${formatAmount(bufferAfter, 0)} stINJ`,
                    tone: willQueue ? 'danger' : 'default',
                  },
                  {
                    label: 'Worst case',
                    value: `${snapshot.config.redemptionDelayDays} days, never unbonding`,
                  },
                ]}
              />

              {willQueue && amount > 0n ? (
                <Banner tone="warn" title="This redemption will queue" compact>
                  The buffer holds {formatAmount(snapshot.protocol.bufferLst, 2)} stINJ. The request
                  is recorded with a {snapshot.config.redemptionDelayDays}-day worst case and stays
                  visible in the queue.
                </Banner>
              ) : null}

              <Button
                full
                size="lg"
                onClick={redeem}
                loading={busy === 'redeem'}
                disabled={!canRedeem}
                data-testid="redeem-submit"
                iconRight={<ArrowUpRight size={18} weight="bold" aria-hidden="true" />}
              >
                Redeem qINJ
              </Button>
              <p className="form-note">
                <Info size={14} weight="regular" aria-hidden="true" />
                Redeeming does not reduce your Basin debt. If you owe qINJ, you still need qINJ in
                the wallet for Wellspring to burn.
              </p>
            </Panel>

            <Panel meta="Queue" title="Redemption ledger">
              {snapshot.redemptions.length === 0 ? (
                <div className="ledger-empty">
                  <Clock size={20} weight="regular" aria-hidden="true" />
                  <p>No redemptions yet. A queued request would appear here with its unlock time.</p>
                </div>
              ) : (
                <ul className="ledger-list">
                  {snapshot.redemptions.map((redemption) => (
                    <li className="ledger-list__item" key={redemption.id}>
                      <span
                        className={`ledger-list__icon ledger-list__icon--${
                          redemption.status === 'paid' ? 'confirmed' : 'queued'
                        }`}
                      >
                        <Clock size={16} weight="regular" aria-hidden="true" />
                      </span>
                      <div className="ledger-list__copy">
                        <strong>
                          {redemption.status === 'paid' ? 'Paid' : 'Queued'} ·{' '}
                          {formatAmount(redemption.lst, 4)} stINJ
                        </strong>
                        <span>
                          {redemption.status === 'paid'
                            ? 'Released from the Confluence buffer.'
                            : `Unlocks by ${formatDateTime(redemption.unlockAt)}.`}
                        </span>
                      </div>
                      <div className="ledger-list__meta">
                        <span>{formatAmount(redemption.qinj, 2)} qINJ</span>
                        <time dateTime={new Date(redemption.requestedAt).toISOString()}>
                          {formatDateTime(redemption.requestedAt)}
                        </time>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>

          <aside className="confluence-grid__side">
            <BufferGauge
              bufferLst={snapshot.protocol.bufferLst}
              targetLst={snapshot.protocol.bufferTargetLst}
              queuedLst={snapshot.protocol.queuedLst}
            />
            {lowBuffer ? (
              <Banner tone="warn" title="Buffer is low" compact>
                Redemptions are likely to queue. The queue is visible and the action stays open.
              </Banner>
            ) : null}
            <div className="stat-grid stat-grid--two">
              <Stat
                label="qINJ wallet"
                value={formatAmount(snapshot.position.qinjBalance, 2)}
                unit="qINJ"
              />
              <Stat
                label="Debt"
                value={formatAmount(snapshot.position.debtQinj, 2)}
                unit="qINJ"
                tone={snapshot.position.debtQinj > 0n ? 'danger' : 'success'}
                note="redemption does not change it"
              />
            </div>
            <div className="instrument-note">
              <div className="instrument-note__title">
                <Warning size={14} weight="bold" aria-hidden="true" /> Payout is not INJ
              </div>
              <p>
                You receive stINJ. If you need INJ, you still need a liquid venue. The demo does
                not pretend Confluence is an instant INJ exit.
              </p>
            </div>
            <div className="instrument-note">
              <div className="instrument-note__title">
                <Info size={14} weight="bold" aria-hidden="true" /> Buffer is simulated
              </div>
              <p>
                The LST buffer is a demo liquidity reserve, not a claim about production
                liquidity. The protocol change owns the real route.
              </p>
            </div>
            {queue.length > 0 ? (
              <Link to="/app/activity" className="text-link">
                Inspect the queue in Activity
                <ArrowUpRight size={14} weight="bold" aria-hidden="true" />
              </Link>
            ) : null}
          </aside>
        </div>
      )}
    </div>
  );
}