import { formatAmount } from '../client/math';

export function Vessel({
  fillPct,
  label,
  value,
  unit,
  sublabel,
}: {
  fillPct: number;
  label: string;
  value: bigint;
  unit: string;
  sublabel?: string;
}) {
  const safeFill = Math.max(0, Math.min(100, fillPct));
  return (
    <div className="vessel" aria-label={`${label}: ${formatAmount(value, 2)} ${unit}`}>
      <div className="vessel__top">
        <span>{label}</span>
        <span className="vessel__tick">100%</span>
      </div>
      <div className="vessel__body">
        <div
          className="vessel__fill"
          style={{ height: `${safeFill}%`, opacity: safeFill === 0 ? 0 : 1 }}
        />
        <div className="vessel__ticks" aria-hidden="true" />
        <div className="vessel__readout">
          <strong>{formatAmount(value, 2)}</strong>
          <span>{unit}</span>
        </div>
      </div>
      <div className="vessel__foot">
        <span>{sublabel ?? 'Collateral pressure'}</span>
        <span>{safeFill.toFixed(0)}%</span>
      </div>
    </div>
  );
}