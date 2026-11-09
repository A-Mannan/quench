import { useState } from 'react';
import { ArrowDown, ArrowUp, Info } from '@phosphor-icons/react';
import { PROTOCOL_CONFIG, useQuench } from '../client';
import { formatAmount, formatPct, formatRate, parseTokenInput } from '../client/math';
import { useAction } from '../lib/useAction';
import { AmountField } from '../components/AmountField';
import { Banner } from '../components/Banner';
import { Button } from '../components/Button';
import { Consequences } from '../components/Consequences';
import { PageHeader } from '../components/PageHeader';
import { Panel } from '../components/Panel';
import { StateBanner } from '../components/StateBanner';
import { Stat } from '../components/Stat';
import { Vessel } from '../components/Vessel';

export default function Basin() {
  const { client, snapshot } = useQuench();
  const { busy, error, run } = useAction();
  const [depositInput, setDepositInput] = useState('');
  const [withdrawInput, setWithdrawInput] = useState('');

  const depositAmount = parseTokenInput(depositInput);
  const withdrawAmount = parseTokenInput(withdrawInput);
  const fillPct =
    PROTOCOL_CONFIG.initialWalletLst === 0n
      ? 0
      : (Number(snapshot.position.collateralLst) / Number(PROTOCOL_CONFIG.initialWalletLst)) * 100;
  const entriesPaused = snapshot.protocol.pausedMints || snapshot.network === 'wrong';
  const depositError =
    depositAmount > 0n && depositAmount > snapshot.position.walletLst
      ? `Exceeds the wallet balance (${formatAmount(snapshot.position.walletLst, 2)} stINJ). Use MAX or lower the amount.`
      : undefined;
  const withdrawError =
    withdrawAmount > 0n && withdrawAmount > snapshot.position.collateralLst
      ? `Exceeds Basin collateral (${formatAmount(snapshot.position.collateralLst, 2)} stINJ).`
      : undefined;
  const withdrawEnabled =
    snapshot.position.debtQinj === 0n &&
    snapshot.position.collateralLst > 0n &&
    snapshot.network === 'testnet';

  const deposit = async () => {
    await run('deposit', async () => {
      await client.deposit(depositAmount);
      setDepositInput('');
    });
  };

  const withdraw = async () => {
    await run('withdraw', async () => {
      await client.withdraw(withdrawAmount);
      setWithdrawInput('');
    });
  };

  return (
    <div className="page">
      <PageHeader
        kicker="Basin"
        title="Put the collateral in."
        lede="The Basin holds one LST. Its value is read from the LST exchange rate, never a DEX. Withdraw only when debt is zero; pausing never blocks that exit."
        aside={
          <div className="page-head__aside-stack">
            <span className="mono page-head__aside-note">one asset · one vessel</span>
            <span className="mono page-head__aside-note">
              {snapshot.config.lstSymbol} / {formatRate(snapshot.rate.value)} INJ
            </span>
          </div>
        }
      />

      <StateBanner />
      {error ? (
        <Banner tone="danger" title="Basin action failed">
          {error}
        </Banner>
      ) : null}

      <div className="basin-grid">
        <div className="basin-grid__forms">
          <Panel meta="Entry" title="Deposit stINJ">
            <AmountField
              id="deposit-amount"
              label="Amount to deposit"
              value={depositInput}
              onChange={setDepositInput}
              unit="stINJ"
              maxLabel={`Wallet: ${formatAmount(snapshot.position.walletLst, 2)} stINJ`}
              onMax={() => setDepositInput(formatAmount(snapshot.position.walletLst, 18))}
              helper="The LST stays in the Basin. You keep the yield exposure."
              error={depositError}
              disabled={entriesPaused}
              testId="deposit-input"
            />
            <Consequences
              items={[
                {
                  label: 'From wallet',
                  value: `${formatAmount(depositAmount, 2)} stINJ`,
                },
                {
                  label: 'Basin collateral after',
                  value: `${formatAmount(snapshot.position.collateralLst + depositAmount, 2)} stINJ`,
                  tone: depositError ? 'danger' : 'success',
                },
                {
                  label: 'Value after',
                  value: `${formatAmount(
                    ((snapshot.position.collateralLst + depositAmount) * snapshot.rate.value) / 10n ** 18n,
                    2,
                  )} INJ`,
                },
              ]}
            />
            {entriesPaused ? (
              <Banner tone="warn" title="Entries are paused" compact>
                The rate is {snapshot.rate.status} or the network is wrong. Deposits reopen when the
                rate is fresh and the network is Injective Testnet 1439.
              </Banner>
            ) : null}
            <Button
              full
              size="lg"
              onClick={deposit}
              loading={busy === 'deposit'}
              disabled={
                entriesPaused ||
                depositAmount <= 0n ||
                depositAmount > snapshot.position.walletLst
              }
              data-testid="deposit-submit"
              iconRight={<ArrowDown size={18} weight="bold" aria-hidden="true" />}
            >
              Deposit stINJ
            </Button>
          </Panel>

          <Panel meta="Exit" title="Withdraw stINJ">
            <AmountField
              id="withdraw-amount"
              label="Amount to withdraw"
              value={withdrawInput}
              onChange={setWithdrawInput}
              unit="stINJ"
              maxLabel={`Basin: ${formatAmount(snapshot.position.collateralLst, 2)} stINJ`}
              onMax={() => setWithdrawInput(formatAmount(snapshot.position.collateralLst, 18))}
              helper={
                snapshot.position.debtQinj > 0n
                  ? 'Withdraw unlocks only at zero debt.'
                  : 'Debt is zero. This exit is open even when mints and harvest are paused.'
              }
              disabled={!withdrawEnabled}
              error={withdrawError}
            />
            <Consequences
              items={[
                {
                  label: 'Debt now',
                  value: `${formatAmount(snapshot.position.debtQinj, 2)} qINJ`,
                  tone: snapshot.position.debtQinj > 0n ? 'danger' : 'success',
                },
                {
                  label: 'Basin collateral after',
                  value: `${formatAmount(
                    snapshot.position.collateralLst > withdrawAmount
                      ? snapshot.position.collateralLst - withdrawAmount
                      : 0n,
                    2,
                  )} stINJ`,
                },
                {
                  label: 'Exit status',
                  value:
                    snapshot.position.debtQinj === 0n
                      ? 'Open — no debt'
                      : 'Locked until debt is zero',
                  tone: snapshot.position.debtQinj === 0n ? 'success' : 'danger',
                },
              ]}
            />
            <Button
              full
              size="lg"
              variant="secondary"
              onClick={withdraw}
              loading={busy === 'withdraw'}
              disabled={
                !withdrawEnabled ||
                withdrawAmount <= 0n ||
                withdrawAmount > snapshot.position.collateralLst
              }
              data-testid="withdraw-submit"
              iconRight={<ArrowUp size={18} weight="bold" aria-hidden="true" />}
            >
              Withdraw stINJ
            </Button>
            {snapshot.position.debtQinj > 0n ? (
              <p className="form-note">
                <Info size={14} weight="regular" aria-hidden="true" />
                Wellspring must burn the debt to zero first. The exit is not blocked by a pause;
                it is gated by debt.
              </p>
            ) : null}
          </Panel>
        </div>

        <aside className="basin-grid__side">
          <Vessel
            fillPct={fillPct}
            label="Basin collateral"
            value={snapshot.position.collateralLst}
            unit="stINJ"
            sublabel={`${formatAmount(snapshot.metrics.collateralValueInj, 2)} INJ value`}
          />
          <div className="stat-grid stat-grid--two">
            <Stat
              label="Wallet"
              value={formatAmount(snapshot.position.walletLst, 2)}
              unit="stINJ"
              note="Simulated balance"
            />
            <Stat
              label="Max debt"
              value={formatAmount(snapshot.metrics.maxDebtInj, 2)}
              unit="INJ"
              note={`${formatPct(snapshot.config.maxLtvBps)} max LTV`}
            />
          </div>
          <div className="instrument-note">
            <div className="instrument-note__title">Rate source is fixed</div>
            <p>
              The Basin reads the LST contract’s exchange rate. It does not use DEX spot. A stale or
              out-of-bounds reading pauses entries; it never blocks the exit.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}