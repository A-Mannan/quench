import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Info, Warning } from '@phosphor-icons/react';
import { useQuench, ONE } from '../client';
import { formatAmount, formatPct, mulDiv, parseTokenInput } from '../client/math';
import { useAction } from '../lib/useAction';
import { AmountField } from '../components/AmountField';
import { Banner } from '../components/Banner';
import { Button, ButtonLink } from '../components/Button';
import { Consequences } from '../components/Consequences';
import { HeadroomBar } from '../components/HeadroomBar';
import { PageHeader } from '../components/PageHeader';
import { Panel } from '../components/Panel';
import { StateBanner } from '../components/StateBanner';
import { Stat } from '../components/Stat';

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
  const headroomAfter = maxDebtAfter > debtAfter ? maxDebtAfter - debtAfter : 0n;
  const ltvAfter = collateralValueAfter === 0n ? 0 : Number((debtAfter * 10_000n) / collateralValueAfter);
  const blockedByPause = snapshot.protocol.pausedMints || snapshot.network === 'wrong';
  const canMint = !blockedByPause && amount > 0n && amount <= maxMint && debtAfter <= maxDebtAfter;
  const mintError =
    !blockedByPause && amount > 0n && amount > maxMint
      ? `Above the ${formatAmount(maxMint, 2)} qINJ cap for this collateral. Lower the amount to enable minting.`
      : undefined;

  const mint = async () => {
    await run('mint', async () => {
      await client.mint(amount);
      setInput('');
    });
  };

  return (
    <div className="page">
      <PageHeader
        kicker="Borrow"
        title="Mint qINJ against the Basin."
        lede="qINJ is INJ-denominated. Debt rises by the amount minted; the mint fee leaves your stINJ collateral. Wellspring can only burn qINJ held in this wallet."
        aside={
          <div className="page-head__aside-stack">
            <span className="mono page-head__aside-note">
              max mint {formatAmount(maxMint, 2)} qINJ
            </span>
            <span className="mono page-head__aside-note">
              {formatPct(snapshot.config.maxLtvBps)} max LTV
            </span>
          </div>
        }
      />

      <StateBanner />
      {error ? (
        <Banner tone="danger" title="Mint failed">
          {error}
        </Banner>
      ) : null}

      {snapshot.position.collateralLst === 0n ? (
        <Panel meta="No collateral" title="Deposit first">
          <div className="empty-inline">
            <div>
              <p>
                There is nothing to borrow against yet. Deposit stINJ into the Basin, then come
                back. The mint button stays disabled until the collateral exists.
              </p>
              <ButtonLink to="/app/basin" size="lg">
                Deposit stINJ
              </ButtonLink>
            </div>
            <div className="empty-inline__mark" aria-hidden="true">
              0.00
            </div>
          </div>
        </Panel>
      ) : (
        <div className="borrow-grid">
          <div className="borrow-grid__main">
            <Panel meta="Entry" title="Mint qINJ">
              <AmountField
                id="mint-amount"
                label="qINJ to mint"
                value={input}
                onChange={setInput}
                unit="qINJ"
                maxLabel={`Max mint: ${formatAmount(maxMint, 2)} qINJ`}
                onMax={() => setInput(formatAmount(maxMint, 18))}
                helper="Debt rises by this amount. The mint fee is taken from stINJ collateral, not from qINJ."
                error={mintError}
                disabled={blockedByPause}
                testId="mint-input"
              />
              <Consequences
                items={[
                  {
                    label: 'You receive',
                    value: `${formatAmount(amount, 2)} qINJ`,
                    tone: 'success',
                  },
                  {
                    label: 'Mint fee',
                    value: `${formatAmount(feeLst, 4)} stINJ from collateral`,
                    tone: 'muted',
                  },
                  {
                    label: 'Debt after',
                    value: `${formatAmount(debtAfter, 2)} qINJ`,
                    tone: debtAfter > maxDebtAfter ? 'danger' : 'default',
                  },
                  {
                    label: 'Headroom after',
                    value: `${formatAmount(headroomAfter, 2)} INJ`,
                    tone: headroomAfter === 0n ? 'danger' : 'success',
                  },
                  {
                    label: 'LTV after',
                    value: `${formatPct(ltvAfter)} of ${formatPct(snapshot.config.maxLtvBps)} max`,
                    tone: ltvAfter > snapshot.config.maxLtvBps ? 'danger' : 'default',
                  },
                ]}
              />

              {blockedByPause ? (
                <Banner tone="warn" title="Mints are paused" compact>
                  The rate is {snapshot.rate.status} or the network is wrong. Exits remain open;
                  the mint button re-enables when the rate is fresh and the network is testnet 1439.
                </Banner>
              ) : null}
              {!blockedByPause && amount > maxMint ? (
                <Banner tone="warn" title="Above the LTV bound" compact>
                  Lower the amount or add collateral. The maximum after the fee is{' '}
                  {formatAmount(maxMint, 2)} qINJ.
                </Banner>
              ) : null}

              <Button
                full
                size="lg"
                onClick={mint}
                loading={busy === 'mint'}
                disabled={!canMint}
                data-testid="mint-submit"
                iconRight={<ArrowUpRight size={18} weight="bold" aria-hidden="true" />}
              >
                Mint qINJ
              </Button>
            </Panel>

            <HeadroomBar
              debtQinj={debtAfter}
              maxDebtInj={maxDebtAfter}
              headroomInj={headroomAfter}
              ltvBps={ltvAfter}
              maxLtvBps={snapshot.config.maxLtvBps}
            />
          </div>

          <aside className="borrow-grid__side">
            <div className="stat-grid stat-grid--two">
              <Stat
                label="qINJ in wallet"
                value={formatAmount(snapshot.position.qinjBalance, 2)}
                unit="qINJ"
                note="Wellspring burns this"
              />
              <Stat
                label="Debt now"
                value={formatAmount(snapshot.position.debtQinj, 2)}
                unit="qINJ"
                tone={snapshot.position.debtQinj > 0n ? 'danger' : 'default'}
              />
            </div>

            <div className="instrument-note">
              <div className="instrument-note__title">The consequence you must read</div>
              <p>
                If you move qINJ out of this wallet, Wellspring cannot burn it against your debt.
                Automatic repayment slows or stops until qINJ returns. Confluence redemption does
                not repay your Basin debt.
              </p>
              <Link to="/app/wellspring" className="text-link">
                How repayment works
              </Link>
            </div>

            <div className="instrument-note instrument-note--warn">
              <div className="instrument-note__title">
                <Warning size={14} weight="bold" aria-hidden="true" /> Not a leverage loop
              </div>
              <p>
                This demo has one Basin and one synthetic. It does not model recursive leverage,
                multi-collateral, or a market for qINJ beyond the simulated Confluence buffer.
              </p>
            </div>

            <div className="instrument-note">
              <div className="instrument-note__title">
                <Info size={14} weight="bold" aria-hidden="true" /> Rate source
              </div>
              <p>
                Max mint is recalculated from the LST exchange rate. A stale or out-of-bounds rate
                disables this form; it does not disable the exit.
              </p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}