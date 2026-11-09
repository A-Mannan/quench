import { useMemo, useState } from 'react';
import { ArrowUpRight } from '@phosphor-icons/react';
import { useQuench, ONE } from '../client';
import { formatAmount, formatPct, mulDiv, parseTokenInput } from '../client/math';
import { useAction } from '../lib/useAction';
import { Banner } from '../components/Banner';
import { Button, ButtonLink } from '../components/Button';
import { InstrumentBar } from '../components/InstrumentBar';
import { StateBanner } from '../components/StateBanner';

function maxMintFor(snapshot: ReturnType<typeof useQuench>['snapshot']): bigint {
  const maxDebt = snapshot.metrics.maxDebtInj;
  if (maxDebt <= snapshot.position.debtQinj) return 0n;
  let candidate = maxDebt - snapshot.position.debtQinj;
  for (let i = 0; i < 4; i += 1) {
    const feeValue = mulDiv(candidate, BigInt(snapshot.config.mintFeeBps), 10_000n);
    const feeLst = mulDiv(feeValue, ONE, snapshot.rate.value);
    const collateralAfter =
      snapshot.position.collateralLst > feeLst
        ? snapshot.position.collateralLst - feeLst
        : 0n;
    const maxDebtAfter = mulDiv(
      collateralAfter,
      BigInt(snapshot.config.maxLtvBps),
      10_000n,
    );
    candidate = maxDebtAfter > snapshot.position.debtQinj
      ? maxDebtAfter - snapshot.position.debtQinj
      : 0n;
  }
  return candidate;
}

export default function Borrow() {
  const { client, snapshot } = useQuench();
  const { busy, error, run } = useAction();
  const [input, setInput] = useState('');
  const amount = parseTokenInput(input);
  const maxMint = useMemo(() => maxMintFor(snapshot), [snapshot]);
  const feeValue = mulDiv(amount, BigInt(snapshot.config.mintFeeBps), 10_000n);
  const feeLst = mulDiv(feeValue, ONE, snapshot.rate.value);
  const collateralAfter =
    snapshot.position.collateralLst > feeLst ? snapshot.position.collateralLst - feeLst : 0n;
  const collateralValueAfter = mulDiv(collateralAfter, snapshot.rate.value, ONE);
  const maxDebtAfter = mulDiv(collateralValueAfter, BigInt(snapshot.config.maxLtvBps), 10_000n);
  const debtAfter = snapshot.position.debtQinj + amount;
  const blockedByPause = snapshot.protocol.pausedMints || snapshot.network === 'wrong';
  const canMint = !blockedByPause && amount > 0n && amount <= maxMint && debtAfter <= maxDebtAfter;
  const mintError =
    !blockedByPause && amount > 0n && amount > maxMint
      ? `Max ${formatAmount(maxMint, 2)} qINJ for this collateral.`
      : undefined;

  const mint = async () => {
    await run('mint', async () => {
      await client.mint(amount);
      setInput('');
    });
  };

  const setPct = (pct: number) => {
    const v = (maxMint * BigInt(Math.round(pct * 100))) / 10000n;
    setInput(formatAmount(v, 18));
  };

  return (
    <div className="page-simple page-simple--narrow">
      <StateBanner />
      {error ? (
        <Banner tone="danger" title="Mint failed">
          {error}
        </Banner>
      ) : null}

      <section className="card" aria-label="Loan">
        <InstrumentBar crumb="Loan / 01" chainId={snapshot.chainId} />
        <h2 className="loan-head">Loan</h2>

        {snapshot.position.collateralLst === 0n ? (
          <>
            <p className="muted">Select the collateral asset first.</p>
            <ButtonLink to="/app/basin" full size="lg">
              Deposit stINJ
            </ButtonLink>
          </>
        ) : (
          <>
            <span className="field-label">Collateral</span>
            <div className="token-box">
              <div className="token-box__row">
                <span className="token-box__num">{formatAmount(snapshot.position.collateralLst, 2)}</span>
                <span className="token-pill">
                  <span className="token-ico" aria-hidden="true">◆</span> stINJ
                </span>
              </div>
              <div className="token-box__sub">
                <span>{formatAmount(snapshot.metrics.collateralValueInj, 2)} INJ</span>
                <span>Balance: {formatAmount(snapshot.position.collateralLst, 2)} Max</span>
              </div>
            </div>

            <div>
              <span className="field-label">How much you want to borrow?</span>
              <div className={`token-box amount-field__control${mintError ? ' amount-field--error' : ''}`}>
                <div className="token-box__row">
                  <input
                    id="mint-amount"
                    className="amount-field__input"
                    inputMode="decimal"
                    autoComplete="off"
                    spellCheck={false}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
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

            <div className="mini-row">
              <span>Debt after</span>
              <strong>{formatAmount(debtAfter, 2)} qINJ</strong>
            </div>

            <Button
              full
              size="lg"
              onClick={mint}
              loading={busy === 'mint'}
              disabled={!canMint}
              data-testid="mint-submit"
              iconRight={<ArrowUpRight size={18} weight="bold" aria-hidden="true" />}
            >
              {amount > 0n ? `Borrow ${formatAmount(amount, 2)} qINJ` : 'Borrow qINJ'}
            </Button>

            <p className="fine">
              {formatPct(snapshot.config.maxLtvBps)} max · Fee {formatAmount(feeLst, 4)} stINJ
            </p>
          </>
        )}
      </section>
    </div>
  );
}
