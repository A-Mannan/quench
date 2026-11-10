import { useMemo, useState } from 'react';
import { useQuench, ONE } from '../client';
import { formatAmount, formatPct, mulDiv, parseTokenInput } from '../client/math';
import { useAction } from '../lib/useAction';
import { Banner } from '../components/Banner';
import { Button } from '../components/Button';
import { InstrumentBar } from '../components/InstrumentBar';
import { StateBanner } from '../components/StateBanner';

function maxMintForCollateral(
  collateralLst: bigint,
  debtQinj: bigint,
  snapshot: ReturnType<typeof useQuench>['snapshot'],
): bigint {
  if (collateralLst <= 0n) return 0n;
  let candidate = mulDiv(collateralLst, snapshot.rate.value, ONE);
  candidate = mulDiv(candidate, BigInt(snapshot.config.maxLtvBps), 10_000n);
  candidate = candidate > debtQinj ? candidate - debtQinj : 0n;
  for (let i = 0; i < 4; i += 1) {
    const feeValue = mulDiv(candidate, BigInt(snapshot.config.mintFeeBps), 10_000n);
    const feeLst = mulDiv(feeValue, ONE, snapshot.rate.value);
    const collateralAfter =
      collateralLst > feeLst ? collateralLst - feeLst : 0n;
    const maxDebtAfter = mulDiv(
      collateralAfter,
      BigInt(snapshot.config.maxLtvBps),
      10_000n,
    );
    candidate = maxDebtAfter > debtQinj ? maxDebtAfter - debtQinj : 0n;
  }
  return candidate;
}

export default function Borrow() {
  const { client, snapshot } = useQuench();
  const { busy, error, run } = useAction();
  const [depositInput, setDepositInput] = useState('');
  const [input, setInput] = useState('');
  const depositAmount = parseTokenInput(depositInput);
  const amount = parseTokenInput(input);
  const proposedCollateral = snapshot.position.collateralLst + depositAmount;
  const maxMint = useMemo(
    () =>
      maxMintForCollateral(
        proposedCollateral,
        snapshot.position.debtQinj,
        snapshot,
      ),
    [snapshot, proposedCollateral],
  );
  const feeValue = mulDiv(amount, BigInt(snapshot.config.mintFeeBps), 10_000n);
  const feeLst = mulDiv(feeValue, ONE, snapshot.rate.value);
  const collateralAfter =
    proposedCollateral > feeLst ? proposedCollateral - feeLst : 0n;
  const collateralValueAfter = mulDiv(collateralAfter, snapshot.rate.value, ONE);
  const maxDebtAfter = mulDiv(collateralValueAfter, BigInt(snapshot.config.maxLtvBps), 10_000n);
  const debtAfter = snapshot.position.debtQinj + amount;
  const ltvAfter =
    collateralValueAfter === 0n
      ? debtAfter > 0n
        ? 10_000
        : 0
      : Number((debtAfter * 10_000n) / collateralValueAfter);
  const blockedByPause = snapshot.protocol.pausedMints || snapshot.network === 'wrong';
  const canLoan =
    !blockedByPause &&
    (depositAmount > 0n || amount > 0n) &&
    depositAmount <= snapshot.position.walletLst &&
    (amount === 0n || (amount <= maxMint && debtAfter <= maxDebtAfter));
  const mintError =
    !blockedByPause && amount > 0n && amount > maxMint
      ? `Max ${formatAmount(maxMint, 2)} qINJ for this collateral.`
      : undefined;
  const depositError =
    depositAmount > snapshot.position.walletLst
      ? `Exceeds wallet (${formatAmount(snapshot.position.walletLst, 2)} stINJ).`
      : undefined;

  const submit = async () => {
    await run('loan', async () => {
      await client.depositAndMint(depositAmount, amount);
      setDepositInput('');
      setInput('');
    });
  };

  const setPct = (pct: number) => {
    const v = (maxMint * BigInt(Math.round(pct * 100))) / 10000n;
    setInput(formatAmount(v, 18));
  };

  const headroomAfter = maxDebtAfter > debtAfter ? maxDebtAfter - debtAfter : 0n;
  const ltvFill = Math.min(100, ltvAfter / 100);
  const hasChange = depositAmount > 0n || amount > 0n;

  const actionLabel =
    depositAmount > 0n && amount > 0n
      ? 'Add collateral & borrow'
      : depositAmount > 0n
        ? `Add ${formatAmount(depositAmount, 2)} stINJ`
        : amount > 0n
          ? `Borrow ${formatAmount(amount, 2)} qINJ`
          : 'Add collateral & borrow';

  return (
    <div className="page-simple page-simple--narrow">
      <StateBanner />
      {error ? (
        <Banner tone="danger" title="Loan action failed">
          {error}
        </Banner>
      ) : null}

      <section className="card" aria-label="Loan">
        <InstrumentBar crumb="Loans" chainId={snapshot.chainId} />
        <h2 className="loan-head">Loan</h2>

        <div>
          <span className="field-label">Add stINJ</span>
          <div className={`token-box amount-field__control${depositError ? ' amount-field--error' : ''}`}>
            <div className="token-box__row">
              <input
                id="loan-deposit-amount"
                className="amount-field__input"
                inputMode="decimal"
                autoComplete="off"
                spellCheck={false}
                value={depositInput}
                onChange={(event) => setDepositInput(event.target.value)}
                placeholder="0.00"
                disabled={blockedByPause}
                aria-invalid={depositError ? true : undefined}
                data-testid="loan-deposit-input"
              />
              <span className="token-pill">
                <span className="token-ico" aria-hidden="true">◆</span> stINJ
              </span>
            </div>
            <div className="token-box__sub">
              <span>Current {formatAmount(snapshot.position.collateralLst, 2)} stINJ</span>
              <span className="chips">
                <span>Wallet {formatAmount(snapshot.position.walletLst, 2)}</span>
                <button
                  type="button"
                  className="chip"
                  onClick={() =>
                    setDepositInput(formatAmount(snapshot.position.walletLst, 18))
                  }
                  disabled={blockedByPause}
                >
                  Max
                </button>
              </span>
            </div>
            {depositError ? (
              <div className="amount-field__help amount-field__help--error" role="alert">{depositError}</div>
            ) : null}
          </div>
        </div>

        <div>
          <span className="field-label">Borrow qINJ</span>
          <div className={`token-box amount-field__control${mintError ? ' amount-field--error' : ''}`}>
            <div className="token-box__row">
              <input
                id="mint-amount"
                className="amount-field__input"
                inputMode="decimal"
                autoComplete="off"
                spellCheck={false}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="0.00"
                disabled={blockedByPause}
                aria-invalid={mintError ? true : undefined}
                data-testid="mint-input"
              />
              <span className="token-pill">
                <span className="token-ico" aria-hidden="true">Q</span> qINJ
              </span>
            </div>
            <div className="token-box__sub">
              <span>Max {formatAmount(maxMint, 2)}</span>
              <span className="chips" role="group" aria-label="Quick amounts">
                <button type="button" className="chip" onClick={() => setPct(20)} disabled={blockedByPause}>
                  20%
                </button>
                <button type="button" className="chip" onClick={() => setPct(30)} disabled={blockedByPause}>
                  30%
                </button>
                <button type="button" className="chip" onClick={() => setInput(formatAmount(maxMint, 18))} disabled={blockedByPause}>
                  Max
                </button>
              </span>
            </div>
            {mintError ? (
              <div className="amount-field__help amount-field__help--error" role="alert">{mintError}</div>
            ) : null}
          </div>
        </div>

        <div className="after-strip" aria-live="polite" aria-label="After this transaction">
          <div className="after-strip__head">
            <span className={`after-strip__dot${hasChange ? ' is-live' : ''}`} aria-hidden="true" />
            <span>{hasChange ? 'After this transaction' : 'Current position'}</span>
            {hasChange ? (
              <span className="after-strip__fee">Fee {formatAmount(feeLst, 4)} stINJ</span>
            ) : null}
          </div>
          <dl className="after-strip__grid">
            <div>
              <dt>Collateral</dt>
              <dd>{formatAmount(collateralAfter, 2)} <span>stINJ</span></dd>
              <small>
                {hasChange
                  ? `+${formatAmount(depositAmount > feeLst ? depositAmount - feeLst : 0n, 2)}`
                  : 'Unchanged'}
              </small>
            </div>
            <div>
              <dt>Debt</dt>
              <dd>{formatAmount(debtAfter, 2)} <span>qINJ</span></dd>
              <small>{hasChange ? `+${formatAmount(amount, 2)}` : 'Unchanged'}</small>
            </div>
            <div>
              <dt>LTV</dt>
              <dd>{formatPct(ltvAfter)}</dd>
              <small>of {formatPct(snapshot.config.maxLtvBps)} max</small>
            </div>
          </dl>
          <div className="after-strip__meter">
            <span>Headroom {formatAmount(headroomAfter, 2)} qINJ</span>
            <span className="after-strip__bar" aria-hidden="true">
              <span style={{ width: `${ltvFill}%` }} />
            </span>
          </div>
        </div>

        <Button
          full
          size="lg"
          onClick={submit}
          loading={busy === 'loan'}
          disabled={!canLoan}
          data-testid="mint-submit"
          iconRight={false}
        >
          {actionLabel}
        </Button>
      </section>
    </div>
  );
}
