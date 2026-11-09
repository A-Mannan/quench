import { useState } from 'react';
import { ArrowDown, ArrowUp } from '@phosphor-icons/react';
import { useQuench } from '../client';
import { formatAmount, formatRate, parseTokenInput } from '../client/math';
import { useAction } from '../lib/useAction';
import { AmountField } from '../components/AmountField';
import { Banner } from '../components/Banner';
import { Button } from '../components/Button';
import { InstrumentBar } from '../components/InstrumentBar';
import { StateBanner } from '../components/StateBanner';

export default function Basin() {
  const { client, snapshot } = useQuench();
  const { busy, error, run } = useAction();
  const [depositInput, setDepositInput] = useState('');
  const [withdrawInput, setWithdrawInput] = useState('');

  const depositAmount = parseTokenInput(depositInput);
  const withdrawAmount = parseTokenInput(withdrawInput);
  const entriesPaused = snapshot.protocol.pausedMints || snapshot.network === 'wrong';
  const depositError =
    depositAmount > 0n && depositAmount > snapshot.position.walletLst
      ? `Exceeds wallet (${formatAmount(snapshot.position.walletLst, 2)} stINJ).`
      : undefined;
  const withdrawError =
    withdrawAmount > 0n && withdrawAmount > snapshot.position.collateralLst
      ? `Exceeds Basin (${formatAmount(snapshot.position.collateralLst, 2)} stINJ).`
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
    <div className="page-simple page-simple--narrow">
      <div className="simple-head">
        <h1>Basin</h1>
        <p>
          {snapshot.config.lstSymbol} · {formatRate(snapshot.rate.value)} INJ
        </p>
      </div>

      <StateBanner />
      {error ? (
        <Banner tone="danger" title="Basin action failed">
          {error}
        </Banner>
      ) : null}

      <section className="card" aria-label="Deposit">
        <InstrumentBar crumb="Basin / 01" chainId={snapshot.chainId} />
        <h2>Deposit</h2>
        <AmountField
          id="deposit-amount"
          label="Amount"
          value={depositInput}
          onChange={setDepositInput}
          unit="stINJ"
          maxLabel={`Wallet ${formatAmount(snapshot.position.walletLst, 2)}`}
          onMax={() => setDepositInput(formatAmount(snapshot.position.walletLst, 18))}
          error={depositError}
          disabled={entriesPaused}
          testId="deposit-input"
        />
        <div className="mini-row">
          <span>Basin after</span>
          <strong>{formatAmount(snapshot.position.collateralLst + depositAmount, 2)} stINJ</strong>
        </div>
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
      </section>

      <section className="card" aria-label="Withdraw">
        <InstrumentBar crumb="Basin / 02" chainId={snapshot.chainId} />
        <h2>Withdraw</h2>
        <AmountField
          id="withdraw-amount"
          label="Amount to withdraw"
          value={withdrawInput}
          onChange={setWithdrawInput}
          unit="stINJ"
          maxLabel={`Basin ${formatAmount(snapshot.position.collateralLst, 2)}`}
          onMax={() => setWithdrawInput(formatAmount(snapshot.position.collateralLst, 18))}
          helper={
            snapshot.position.debtQinj > 0n
              ? 'Locked until debt is zero.'
              : undefined
          }
          disabled={!withdrawEnabled}
          error={withdrawError}
        />
        <div className="mini-row">
          <span>Debt</span>
          <strong>
            {formatAmount(snapshot.position.debtQinj, 2)} qINJ
          </strong>
        </div>
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
      </section>
    </div>
  );
}
