import { useId } from 'react';
import type { CurvePoint } from '../domain/curve';
import { monthLabel, niceMax } from '../domain/curve';
import { formatCompact } from '../client/math';
import { useReducedMotion } from '../lib/useReducedMotion';

interface PressureCurveProps {
  points: CurvePoint[];
  currentMonth?: number;
  compact?: boolean;
  caption?: string;
  eyebrow?: string;
  ariaLabel?: string;
  showCollateral?: boolean;
}

export function PressureCurve({
  points,
  currentMonth,
  compact = false,
  caption,
  eyebrow = 'Debt pressure',
  ariaLabel = 'Debt falling against collateral value and the maximum LTV boundary',
  showCollateral = true,
}: PressureCurveProps) {
  const reducedMotion = useReducedMotion();
  const id = useId().replace(/:/g, '');
  const width = compact ? 520 : 620;
  const height = compact ? 300 : 330;
  const pad = compact
    ? { left: 10, right: 10, top: 18, bottom: 26 }
    : { left: 48, right: 16, top: 22, bottom: 32 };
  const chartWidth = width - pad.left - pad.right;
  const chartHeight = height - pad.top - pad.bottom;
  const visible = points.length > 0 ? points : [{ month: 0, debt: 0, collateral: 0, maxDebt: 0 }];
  const maxMonth = Math.max(1, visible[visible.length - 1]?.month ?? 1);
  const ceiling = niceMax(
    Math.max(
      ...visible.map((point) =>
        Math.max(point.debt, point.maxDebt, showCollateral ? point.collateral : 0),
      ),
      1,
    ),
  );
  const x = (month: number) => pad.left + (month / maxMonth) * chartWidth;
  const y = (value: number) => pad.top + chartHeight - (value / ceiling) * chartHeight;
  const current = currentMonth ?? Math.max(0, visible.length - 1);
  const currentPoint = visible[Math.min(current, visible.length - 1)] ?? visible[0]!;

  const debtPath = visible
    .map((point, index) => `${index === 0 ? 'M' : 'L'}${x(point.month).toFixed(2)},${y(point.debt).toFixed(2)}`)
    .join(' ');
  const collateralPath = visible
    .map(
      (point, index) =>
        `${index === 0 ? 'M' : 'L'}${x(point.month).toFixed(2)},${y(point.collateral).toFixed(2)}`,
    )
    .join(' ');
  const maxDebtPath = visible
    .map(
      (point, index) =>
        `${index === 0 ? 'M' : 'L'}${x(point.month).toFixed(2)},${y(point.maxDebt).toFixed(2)}`,
    )
    .join(' ');
  const headroomPath = `${visible
    .map(
      (point, index) =>
        `${index === 0 ? 'M' : 'L'}${x(point.month).toFixed(2)},${y(point.maxDebt).toFixed(2)}`,
    )
    .join(' ')} ${[...visible]
    .reverse()
    .map((point) => `L${x(point.month).toFixed(2)},${y(point.debt).toFixed(2)}`)
    .join(' ')} Z`;

  const yLines = [0, 0.25, 0.5, 0.75, 1];
  const tickLabel = (value: number) => {
    if (ceiling >= 1000) {
      return `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`;
    }
    if (ceiling >= 20) return value.toFixed(0);
    return value.toFixed(1);
  };
  const xTicks = Array.from(
    new Set([
      0,
      Math.round(maxMonth * 0.25),
      Math.round(maxMonth * 0.5),
      Math.round(maxMonth * 0.75),
      maxMonth,
    ]),
  ).filter((tick) => tick <= maxMonth);

  return (
    <figure className={`curve${compact ? ' curve--compact' : ''}`}>
      <div className="curve__head">
        <figcaption className="curve__eyebrow">{eyebrow}</figcaption>
        <div className="curve__legend" aria-hidden="true">
          <span className="curve__key curve__key--debt">Debt</span>
          {showCollateral ? (
            <span className="curve__key curve__key--collateral">Collateral</span>
          ) : null}
          <span className="curve__key curve__key--headroom">Headroom</span>
          <span className="curve__key curve__key--max">Max LTV</span>
        </div>
      </div>
      <svg
        className="curve__svg"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={ariaLabel}
      >
        <title>{ariaLabel}</title>
        <desc>
          {showCollateral
            ? 'A debt line falls toward zero while collateral value rises. The shaded band is the headroom between debt and the maximum LTV boundary.'
            : 'A debt line falls toward zero beneath the maximum LTV boundary. The shaded band is the remaining headroom.'}
        </desc>
        <defs>
          <pattern id={`${id}-dots`} width="8" height="8" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="var(--chart-grid)" />
          </pattern>
          <clipPath id={`${id}-clip`}>
            <rect x={pad.left} y={pad.top} width={chartWidth} height={chartHeight} />
          </clipPath>
        </defs>

        <rect
          x={pad.left}
          y={pad.top}
          width={chartWidth}
          height={chartHeight}
          fill={`url(#${id}-dots)`}
          opacity="0.55"
        />

        {yLines.map((fraction) => {
          const lineY = pad.top + chartHeight - fraction * chartHeight;
          return (
            <g key={fraction}>
              <line
                x1={pad.left}
                x2={width - pad.right}
                y1={lineY}
                y2={lineY}
                className="curve__grid"
              />
              <text x={pad.left - 10} y={lineY + 3} textAnchor="end" className="curve__axis">
                {tickLabel(ceiling * fraction)}
              </text>
            </g>
          );
        })}

        <g clipPath={`url(#${id}-clip)`}>
          <path d={headroomPath} fill="var(--chart-headroom)" />
          <path d={maxDebtPath} className="curve__max" />
          {showCollateral ? <path d={collateralPath} className="curve__collateral" /> : null}
          <path
            d={debtPath}
            className={`curve__debt${reducedMotion ? ' curve__debt--static' : ''}`}
          />
          <circle
            cx={x(currentPoint.month)}
            cy={y(currentPoint.debt)}
            r="5"
            className="curve__point"
          />
          {!reducedMotion ? (
            <circle
              cx={x(currentPoint.month)}
              cy={y(currentPoint.debt)}
              r="5"
              className="curve__pulse"
            />
          ) : null}
        </g>

        {xTicks.map((tick) => (
          <text
            key={tick}
            x={x(tick)}
            y={height - 12}
            textAnchor={tick === 0 ? 'start' : tick === maxMonth ? 'end' : 'middle'}
            className="curve__axis"
          >
            {monthLabel(tick)}
          </text>
        ))}

        <text
          x={x(currentPoint.month)}
          y={Math.max(18, y(currentPoint.debt) - 14)}
          textAnchor={currentPoint.month > maxMonth * 0.75 ? 'end' : 'start'}
          className="curve__callout"
        >
          {formatCompact(BigInt(Math.round(currentPoint.debt * 1e18)))} qINJ debt
        </text>
      </svg>
      {caption ? <figcaption className="curve__caption">{caption}</figcaption> : null}
    </figure>
  );
}