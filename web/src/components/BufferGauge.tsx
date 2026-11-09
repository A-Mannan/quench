import { formatAmount } from '../client/math';

export function BufferGauge({
  bufferLst,
  targetLst,
  queuedLst,
  compact = false,
}: {
  bufferLst: bigint;
  targetLst: bigint;
  queuedLst: bigint;
  compact?: boolean;
}) {
  const ratio =
    targetLst === 0n ? 0 : Math.max(0, Math.min(100, Number((bufferLst * 10_000n) / targetLst) / 100));
  const queuedRatio =
    targetLst === 0n
      ? 0
      : Math.max(0, Math.min(100 - ratio, Number((queuedLst * 10_000n) / targetLst) / 100));
  const low = ratio < 35;

  return (
    <div className={`buffer${low ? ' buffer--low' : ''}${compact ? ' buffer--compact' : ''}`}>
      <div className="buffer__top">
        <div>
          <div className="buffer__label">Confluence buffer</div>
          <div className="buffer__value">
            {formatAmount(bufferLst, 0)} <span>stINJ</span>
          </div>
        </div>
        <div className="buffer__target">
          target <strong>{formatAmount(targetLst, 0)}</strong>
        </div>
      </div>
      <div
        className="buffer__track"
        role="progressbar"
        aria-label="Confluence buffer against its target"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(ratio)}
      >
        <div className="buffer__fill" style={{ width: `${ratio}%` }} />
        <div className="buffer__queued" style={{ left: `${ratio}%`, width: `${queuedRatio}%` }} />
        <div className="buffer__marker" style={{ left: '75%' }} />
      </div>
      <div className="buffer__foot">
        <span>{queuedLst > 0n ? `${formatAmount(queuedLst, 2)} stINJ queued` : 'No queue'}</span>
        <span>{low ? 'Queue likely' : 'LST available'}</span>
      </div>
    </div>
  );
}