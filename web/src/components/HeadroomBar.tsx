import { formatAmount, formatPct } from '../client/math';

export function HeadroomBar({
  debtQinj,
  maxDebtInj,
  headroomInj,
  ltvBps,
  maxLtvBps,
  unit = 'INJ',
}: {
  debtQinj: bigint;
  maxDebtInj: bigint;
  headroomInj: bigint;
  ltvBps: number;
  maxLtvBps: number;
  unit?: string;
}) {
  const ratio =
    maxDebtInj === 0n
      ? 0
      : Math.max(0, Math.min(100, Number((debtQinj * 10_000n) / maxDebtInj) / 100));
  const tone = ratio >= 90 ? 'danger' : ratio >= 65 ? 'warn' : 'ok';

  return (
    <div className={`headroom headroom--${tone}`}>
      <div className="headroom__top">
        <div>
          <div className="headroom__label">Headroom</div>
          <div className="headroom__value">
            {formatAmount(headroomInj, 2)} <span>{unit}</span>
          </div>
        </div>
        <div className="headroom__ltv">
          <span>{formatPct(ltvBps)}</span>
          <small>of {formatPct(maxLtvBps)} max LTV</small>
        </div>
      </div>
      <div
        className="headroom__track"
        role="progressbar"
        aria-label="Debt as a share of the maximum LTV"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(ratio)}
      >
        <div className="headroom__fill" style={{ width: `${ratio}%` }} />
        <div className="headroom__boundary" style={{ left: '100%' }} />
      </div>
      <div className="headroom__foot">
        <span>
          {formatAmount(debtQinj, 2)} qINJ debt against {formatAmount(maxDebtInj, 2)} {unit} max
        </span>
        <span>{ratio >= 90 ? 'Close to the boundary' : 'Room before the boundary'}</span>
      </div>
    </div>
  );
}