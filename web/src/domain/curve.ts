export interface CurvePoint {
  month: number;
  debt: number;
  collateral: number;
  maxDebt: number;
}

export interface ProjectionInput {
  collateralInj: number;
  debtInj: number;
  aprBps: number;
  maxLtvBps: number;
  months?: number;
}

export function projectCurve({
  collateralInj,
  debtInj,
  aprBps,
  maxLtvBps,
  months = 120,
}: ProjectionInput): CurvePoint[] {
  const points: CurvePoint[] = [];
  let collateral = Math.max(0, collateralInj);
  let debt = Math.max(0, debtInj);
  const monthlyRate = aprBps / 10_000 / 12;
  const maxLtv = maxLtvBps / 10_000;

  for (let month = 0; month <= months; month += 1) {
    points.push({
      month,
      debt,
      collateral,
      maxDebt: collateral * maxLtv,
    });
    if (debt <= 0) break;
    const yieldThisMonth = collateral * monthlyRate;
    debt = Math.max(0, debt - yieldThisMonth);
    collateral *= 1 + monthlyRate;
  }

  return points;
}

export function monthsToZero(input: ProjectionInput): number | null {
  const points = projectCurve({ ...input, months: 600 });
  const zero = points.find((point) => point.debt <= 0);
  return zero ? zero.month : null;
}

export function niceMax(value: number): number {
  if (value <= 0) return 1;
  const exponent = Math.floor(Math.log10(value));
  const magnitude = 10 ** exponent;
  const normalized = value / magnitude;
  const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return step * magnitude;
}

export function monthLabel(month: number): string {
  if (month === 0) return 'now';
  if (month % 12 === 0) return `${month / 12}y`;
  return `${month}m`;
}