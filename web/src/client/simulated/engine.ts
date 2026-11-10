import { PROTOCOL_CONFIG, REDEMPTION_DELAY_MS, SOURCES, STALE_AFTER_MS } from '../config';
import { bpsOf, minBigInt, mulDiv } from '../math';
import {
  DAY_MS,
  ONE,
  type ActivityEvent,
  type EventStatus,
  type HistoryPoint,
  type Network,
  type RateStatus,
  type Redemption,
  type Snapshot,
  type TxOutcome,
  type TxState,
} from '../types';

export interface SimState {
  version: 1;
  connected: boolean;
  network: Network;
  now: number;
  collateralLst: bigint;
  debtQinj: bigint;
  qinjBalance: bigint;
  walletLst: bigint;
  treasuryQinj: bigint;
  treasuryLst: bigint;
  bufferLst: bigint;
  lastHarvestRate: bigint;
  rate: bigint;
  rateUpdatedAt: number;
  rateDropFlag: boolean;
  liquidated: boolean;
  badDebtInj: bigint;
  history: HistoryPoint[];
  events: ActivityEvent[];
  redemptions: Redemption[];
  tx: TxState;
  nextOutcome: TxOutcome;
  idCounter: number;
}

export function createInitialState(): SimState {
  const now = PROTOCOL_CONFIG.simulationStart;
  return {
    version: 1,
    connected: false,
    network: 'testnet',
    now,
    collateralLst: 0n,
    debtQinj: 0n,
    qinjBalance: 0n,
    walletLst: PROTOCOL_CONFIG.initialWalletLst,
    treasuryQinj: 0n,
    treasuryLst: 0n,
    bufferLst: PROTOCOL_CONFIG.initialBufferLst,
    lastHarvestRate: PROTOCOL_CONFIG.initialRate,
    rate: PROTOCOL_CONFIG.initialRate,
    rateUpdatedAt: now,
    rateDropFlag: false,
    liquidated: false,
    badDebtInj: 0n,
    history: [
      {
        t: now,
        debt: 0n,
        collateralValue: 0n,
        rate: PROTOCOL_CONFIG.initialRate,
        kind: 'start',
      },
    ],
    events: [],
    redemptions: [],
    tx: { kind: null, status: 'idle' },
    nextOutcome: 'success',
    idCounter: 0,
  };
}

function cloneState(state: SimState): SimState {
  return {
    ...state,
    history: state.history.map((point) => ({ ...point })),
    events: state.events.map((event) => ({ ...event })),
    redemptions: state.redemptions.map((redemption) => ({ ...redemption })),
    tx: { ...state.tx },
  };
}

function eventHash(state: SimState): string {
  const seed = BigInt(state.idCounter + 1) * 0x9e3779b97f4a7c15n + BigInt(state.now);
  return `0x${seed.toString(16).padStart(64, '0').slice(-64)}`;
}

function addEvent(
  state: SimState,
  event: Omit<ActivityEvent, 'id' | 'at' | 'hash' | 'status'> & {
    status?: EventStatus;
  },
): void {
  state.idCounter += 1;
  const { status = 'confirmed', ...rest } = event;
  state.events.push({
    id: `e${state.idCounter}`,
    at: state.now,
    hash: eventHash(state),
    status,
    ...rest,
  });
  if (state.events.length > 120) state.events = state.events.slice(-120);
}

function recordHistory(
  state: SimState,
  kind: HistoryPoint['kind'],
): void {
  state.history.push({
    t: state.now,
    debt: state.debtQinj,
    collateralValue: mulDiv(state.collateralLst, state.rate, ONE),
    rate: state.rate,
    kind,
  });
  if (state.history.length > 240) state.history = state.history.slice(-240);
}

export function collateralValueOf(state: SimState): bigint {
  return mulDiv(state.collateralLst, state.rate, ONE);
}

export function maxDebtOf(state: SimState): bigint {
  return mulDiv(collateralValueOf(state), BigInt(PROTOCOL_CONFIG.maxLtvBps), 10_000n);
}

export function ltvBpsOf(state: SimState): number {
  const value = collateralValueOf(state);
  if (value === 0n) return state.debtQinj > 0n ? 10_000 : 0;
  return Number((state.debtQinj * 10_000n) / value);
}

export function yieldSinceHarvestOf(state: SimState): bigint {
  if (state.rate <= state.lastHarvestRate) return 0n;
  return mulDiv(state.collateralLst, state.rate - state.lastHarvestRate, ONE);
}

export function isLiquidationEligible(state: SimState): boolean {
  return state.debtQinj > 0n && state.debtQinj > maxDebtOf(state);
}

export function deriveRateStatus(state: SimState): RateStatus {
  if (state.rateDropFlag) return 'drop';
  if (state.now - state.rateUpdatedAt > STALE_AFTER_MS) return 'stale';
  if (state.rate < PROTOCOL_CONFIG.rateMin || state.rate > PROTOCOL_CONFIG.rateMax) {
    return 'out-of-bounds';
  }
  return 'fresh';
}

export function pausedMintsOf(state: SimState): boolean {
  return (
    state.network !== 'testnet' ||
    deriveRateStatus(state) !== 'fresh' ||
    isLiquidationEligible(state)
  );
}

export function pausedHarvestOf(state: SimState): boolean {
  return pausedMintsOf(state);
}

function assertActive(state: SimState, action: string): void {
  if (state.network !== 'testnet') {
    throw new Error(`Wrong network: switch to Injective Testnet to ${action}.`);
  }
}

function assertFreshRate(state: SimState, action: string): void {
  const status = deriveRateStatus(state);
  if (status !== 'fresh') {
    throw new Error(`Rate is ${status}; ${action} is paused. Exits remain open.`);
  }
}

function assertNotLiquidating(state: SimState, action: string): void {
  if (isLiquidationEligible(state)) {
    throw new Error(`Position is liquidation-eligible; ${action} is paused. Exits remain open.`);
  }
}

export function connectState(state: SimState): SimState {
  const next = cloneState(state);
  next.connected = true;
  addEvent(next, {
    type: 'connect',
    title: 'Simulated wallet connected',
    detail: 'No real wallet, key or network request was made.',
    status: 'info',
  });
  return next;
}

export function depositState(state: SimState, amount: bigint): SimState {
  assertActive(state, 'deposit');
  assertFreshRate(state, 'deposit');
  assertNotLiquidating(state, 'deposit');
  if (amount <= 0n) throw new Error('Enter an amount greater than zero.');
  if (amount > state.walletLst) throw new Error('Amount exceeds the simulated wallet balance.');

  let next = cloneState(state);
  if (next.debtQinj > 0n && yieldSinceHarvestOf(next) > 0n) {
    next = harvestState(next);
  }
  next.walletLst -= amount;
  next.collateralLst += amount;
  recordHistory(next, 'deposit');
  addEvent(next, {
    type: 'deposit',
    title: 'Collateral deposited',
    detail: `${amount / ONE} stINJ moved into the vault.`,
    amount,
    unit: 'stINJ',
    status: 'confirmed',
  });
  return next;
}

export function mintState(state: SimState, amount: bigint): SimState {
  assertActive(state, 'mint');
  assertFreshRate(state, 'mint');
  assertNotLiquidating(state, 'mint');
  if (amount <= 0n) throw new Error('Enter an amount greater than zero.');
  const next = cloneState(state);
  const feeValue = bpsOf(amount, PROTOCOL_CONFIG.mintFeeBps);
  const feeLst = mulDiv(feeValue, ONE, next.rate);
  if (feeLst > next.collateralLst) {
    throw new Error('The borrow fee exceeds the collateral. Add collateral first.');
  }
  next.collateralLst -= feeLst;
  next.treasuryLst += feeLst;
  const newDebt = next.debtQinj + amount;
  const maxDebt = maxDebtOf(next);
  if (newDebt > maxDebt) {
    throw new Error('That borrow would exceed the maximum LTV after the fee. Lower the amount or add collateral.');
  }
  next.debtQinj = newDebt;
  next.qinjBalance += amount;
  recordHistory(next, 'mint');
  addEvent(next, {
    type: 'mint',
    title: 'qINJ borrowed',
    detail: `Debt rose by ${amount / ONE} qINJ; ${feeLst / ONE} stINJ fee left the collateral for the protocol.`,
    amount,
    unit: 'qINJ',
    status: 'confirmed',
  });
  return next;
}

export function depositAndMintState(
  state: SimState,
  depositAmount: bigint,
  mintAmount: bigint,
): SimState {
  assertActive(state, 'loan');
  assertFreshRate(state, 'loan');
  assertNotLiquidating(state, 'loan');
  if (depositAmount < 0n || mintAmount < 0n) {
    throw new Error('Enter an amount greater than or equal to zero.');
  }
  if (depositAmount === 0n && mintAmount === 0n) {
    throw new Error('Add collateral or borrow an amount greater than zero.');
  }
  if (depositAmount > 0n && depositAmount > state.walletLst) {
    throw new Error('Amount exceeds the simulated wallet balance.');
  }

  let next = depositAmount > 0n ? depositState(state, depositAmount) : state;
  if (mintAmount > 0n) next = mintState(next, mintAmount);
  return next;
}

export function harvestState(state: SimState): SimState {
  assertActive(state, 'harvest');
  assertFreshRate(state, 'harvest');
  assertNotLiquidating(state, 'harvest');
  const next = cloneState(state);
  const yieldInj = yieldSinceHarvestOf(next);
  if (yieldInj === 0n) {
    next.lastHarvestRate = next.rate;
    addEvent(next, {
      type: 'harvest',
      title: 'No new yield',
      detail: 'The exchange rate has not increased since the last repayment.',
      status: 'info',
    });
    return next;
  }

  const repayable = minBigInt(
    yieldInj,
    minBigInt(next.debtQinj, next.qinjBalance),
  );

  if (repayable > 0n) {
    next.qinjBalance -= repayable;
    next.debtQinj -= repayable;
    next.lastHarvestRate = next.rate;
    recordHistory(next, 'harvest');
    addEvent(next, {
      type: 'harvest',
      title: 'Debt repaid',
      detail:
        repayable === yieldInj
          ? `${repayable / ONE} qINJ applied to the debt. Yield stays in the collateral value.`
          : `${repayable / ONE} qINJ applied. The wallet balance limited the repayment; the rest stays in collateral value.`,
      amount: repayable,
      unit: 'qINJ',
      status: 'confirmed',
    });
    return next;
  }

  if (next.debtQinj === 0n) {
    next.lastHarvestRate = next.rate;
    addEvent(next, {
      type: 'harvest',
      title: 'No debt to repay',
      detail: 'Yield stays in the collateral value. Nothing was applied.',
      status: 'info',
    });
    return next;
  }

  addEvent(next, {
    type: 'harvest',
    title: 'Yield available, no qINJ to repay with',
    detail:
      'Repayment can only use qINJ held in this wallet. The pending yield stays unapplied.',
    status: 'warning',
  });
  return next;
}

export function repayState(state: SimState, amount: bigint): SimState {
  assertActive(state, 'repay');
  if (amount <= 0n) throw new Error('Enter an amount greater than zero.');
  if (amount > state.qinjBalance) {
    throw new Error('Amount exceeds the qINJ wallet balance.');
  }
  if (amount > state.debtQinj) {
    throw new Error('Amount exceeds the debt being repaid.');
  }

  const next = cloneState(state);
  next.qinjBalance -= amount;
  next.debtQinj -= amount;
  recordHistory(next, 'repay');
  addEvent(next, {
    type: 'repay',
    title: 'qINJ repaid',
    detail: `${amount / ONE} qINJ applied to the debt. Collateral unchanged.`,
    amount,
    unit: 'qINJ',
    status: 'confirmed',
  });
  return next;
}

export function redeemState(state: SimState, amount: bigint): SimState {
  assertActive(state, 'redeem');
  if (amount <= 0n) throw new Error('Enter an amount greater than zero.');
  if (amount > state.qinjBalance) throw new Error('Amount exceeds the qINJ wallet balance.');
  if (state.rate <= 0n) throw new Error('Exchange rate is not available.');

  const next = cloneState(state);
  const fee = bpsOf(amount, PROTOCOL_CONFIG.redeemFeeBps);
  const net = amount - fee;
  const lstOut = mulDiv(net, ONE, next.rate);
  next.qinjBalance -= amount;

  if (next.bufferLst >= lstOut) {
    next.bufferLst -= lstOut;
    next.walletLst += lstOut;
    addEvent(next, {
      type: 'redeem',
      title: 'qINJ swapped',
      detail: `${lstOut / ONE} stINJ paid from the swap buffer. Not INJ.`,
      amount: lstOut,
      unit: 'stINJ',
      status: 'confirmed',
    });
    return next;
  }

  next.idCounter += 1;
  next.redemptions.push({
    id: `r${next.idCounter}`,
    qinj: amount,
    lst: lstOut,
    requestedAt: next.now,
    unlockAt: next.now + REDEMPTION_DELAY_MS,
    status: 'queued',
  });
  addEvent(next, {
    type: 'redeem',
    title: 'Redemption queued',
    detail: `${lstOut / ONE} stINJ queued. Worst case ${PROTOCOL_CONFIG.redemptionDelayDays} days while the buffer refills. Not INJ, and not 21-day unbonding.`,
    amount: lstOut,
    unit: 'stINJ',
    status: 'queued',
  });
  return next;
}

export function withdrawState(state: SimState, amount: bigint): SimState {
  assertActive(state, 'withdraw');
  if (state.debtQinj > 0n) {
    assertFreshRate(state, 'withdraw');
    assertNotLiquidating(state, 'withdraw');
  }
  if (amount <= 0n) throw new Error('Enter an amount greater than zero.');
  if (amount > state.collateralLst) throw new Error('Amount exceeds collateral.');
  if (state.debtQinj > 0n) {
    const remainingCollateral = state.collateralLst - amount;
    const remainingValue = mulDiv(remainingCollateral, state.rate, ONE);
    const maxDebtAfter = mulDiv(
      remainingValue,
      BigInt(PROTOCOL_CONFIG.maxLtvBps),
      10_000n,
    );
    if (state.debtQinj > maxDebtAfter) {
      throw new Error(
        'That withdrawal would push LTV above the maximum. Lower the amount or repay debt first.',
      );
    }
  }
  const next = cloneState(state);
  next.collateralLst -= amount;
  next.walletLst += amount;
  recordHistory(next, 'withdraw');
  addEvent(next, {
    type: 'withdraw',
    title: 'Collateral withdrawn',
    detail: `${amount / ONE} stINJ returned from the vault.`,
    amount,
    unit: 'stINJ',
    status: 'confirmed',
  });
  return next;
}

export function liquidateState(state: SimState): SimState {
  assertActive(state, 'liquidate');
  if (!isLiquidationEligible(state)) {
    throw new Error('Liquidation is only available when debt exceeds the maximum LTV.');
  }
  const next = cloneState(state);
  const value = collateralValueOf(next);
  const debtCleared = minBigInt(next.debtQinj, value);
  const burnable = minBigInt(next.qinjBalance, debtCleared);
  next.qinjBalance -= burnable;
  next.badDebtInj = next.debtQinj - debtCleared;
  next.debtQinj = 0n;
  next.collateralLst = 0n;
  next.liquidated = true;
  next.rateDropFlag = true;
  recordHistory(next, 'liquidate');
  addEvent(next, {
    type: 'liquidate',
    title: 'Simulated liquidation',
    detail: `${debtCleared / ONE} INJ of collateral seized. ${next.badDebtInj / ONE} INJ recorded as bad debt.`,
    amount: next.badDebtInj,
    unit: 'INJ',
    status: 'warning',
  });
  return next;
}

export function selfLiquidateState(state: SimState): SimState {
  assertActive(state, 'self-liquidate');
  if (state.debtQinj <= 0n || state.collateralLst <= 0n) {
    throw new Error('Only an open position can be self-liquidated.');
  }
  if (state.rate <= 0n) throw new Error('Exchange rate is not available.');

  const next = cloneState(state);
  const qinjBurned = minBigInt(next.qinjBalance, next.debtQinj);
  next.qinjBalance -= qinjBurned;
  const remainingDebt = next.debtQinj - qinjBurned;
  const collateralValue = collateralValueOf(next);
  const collateralUsedToClear = minBigInt(remainingDebt, collateralValue);
  const collateralUsed =
    collateralUsedToClear === 0n
      ? 0n
      : collateralUsedToClear === collateralValue
        ? next.collateralLst
        : (collateralUsedToClear * ONE + next.rate - 1n) / next.rate;
  const badDebt = remainingDebt > collateralValue ? remainingDebt - collateralValue : 0n;
  const residualCollateral = next.collateralLst - collateralUsed;

  next.treasuryLst += collateralUsed;
  next.walletLst += residualCollateral;
  next.collateralLst = 0n;
  next.debtQinj = 0n;
  if (badDebt > 0n) {
    next.badDebtInj = badDebt > next.badDebtInj ? badDebt : next.badDebtInj;
    next.liquidated = true;
  }
  recordHistory(next, 'self-liquidate');
  addEvent(next, {
    type: 'self-liquidate',
    title: 'Position self-liquidated',
    detail:
      badDebt > 0n
        ? `${qinjBurned / ONE} qINJ and ${collateralUsed / ONE} stINJ collateral closed the position; ${badDebt / ONE} INJ remains as bad debt.`
        : `${qinjBurned / ONE} qINJ and ${collateralUsed / ONE} stINJ settled the position; ${residualCollateral / ONE} stINJ returned.`,
    amount: badDebt,
    unit: 'INJ',
    status: badDebt > 0n ? 'warning' : 'confirmed',
  });
  return next;
}

export function fastForwardState(state: SimState, days: number): SimState {
  if (days <= 0) return state;
  let next = cloneState(state);
  let remaining = days;
  const chunks: number[] = [];
  while (remaining > 0) {
    const step = Math.min(30, remaining);
    chunks.push(step);
    remaining -= step;
  }

  for (const step of chunks) {
    const rateDelta = mulDiv(next.rate, BigInt(PROTOCOL_CONFIG.aprBps), 10_000n * 365n) * BigInt(step);
    next.rate += rateDelta;
    next.now += step * DAY_MS;
    next.rateUpdatedAt = next.now;
    if (
      next.debtQinj > 0n &&
      next.qinjBalance > 0n &&
      !next.rateDropFlag &&
      !isLiquidationEligible(next) &&
      deriveRateStatus(next) === 'fresh'
    ) {
      next = harvestState(next);
    }
    next = processQueueState(next);
    if (next.collateralLst > 0n) recordHistory(next, 'harvest');
  }

  addEvent(next, {
    type: 'rate',
    title: `Clock advanced ${days} days`,
    detail: `Rate is now ${(Number(next.rate) / 1e18).toFixed(4)} INJ per stINJ. Quench applied yield where it could.`,
    status: 'info',
  });
  return next;
}

export function processQueueState(state: SimState): SimState {
  let next = state;
  for (const redemption of next.redemptions) {
    if (
      redemption.status === 'queued' &&
      next.now >= redemption.unlockAt &&
      next.bufferLst >= redemption.lst
    ) {
      if (next === state) next = cloneState(state);
      const live = next.redemptions.find((item) => item.id === redemption.id);
      if (!live) continue;
      live.status = 'paid';
      next.bufferLst -= live.lst;
      next.walletLst += live.lst;
      addEvent(next, {
        type: 'redeem',
        title: 'Queued redemption paid',
        detail: `${live.lst / ONE} stINJ released from the swap buffer.`,
        amount: live.lst,
        unit: 'stINJ',
        status: 'confirmed',
      });
    }
  }
  return next;
}

export function dropRateState(state: SimState, bps: number): SimState {
  const next = cloneState(state);
  const factor = BigInt(Math.max(0, 10_000 - bps));
  next.rate = (next.rate * factor) / 10_000n;
  next.rateUpdatedAt = next.now;
  next.rateDropFlag = true;
  next.lastHarvestRate = next.rate;
  recordHistory(next, 'drop');
  addEvent(next, {
    type: 'rate',
    title: `LST rate dropped ${(bps / 100).toFixed(2)}%`,
    detail: `Rate is ${(Number(next.rate) / 1e18).toFixed(4)}. Borrowing and auto-repay paused; exits stay open.`,
    status: 'warning',
  });
  return next;
}

export function spikeRateState(state: SimState, bps: number): SimState {
  const next = cloneState(state);
  const factor = BigInt(10_000 + bps);
  next.rate = (next.rate * factor) / 10_000n;
  next.rateUpdatedAt = next.now;
  next.rateDropFlag = false;
  addEvent(next, {
    type: 'rate',
    title: `LST rate spiked ${(bps / 100).toFixed(2)}%`,
    detail: `Rate is ${(Number(next.rate) / 1e18).toFixed(4)}. Outside the configured bounds; entries paused; exits open.`,
    status: 'warning',
  });
  return next;
}

export function makeStaleState(state: SimState): SimState {
  const next = cloneState(state);
  next.rateUpdatedAt = next.now - STALE_AFTER_MS - DAY_MS;
  addEvent(next, {
    type: 'rate',
    title: 'Rate is stale',
    detail: `No rate update for more than ${PROTOCOL_CONFIG.staleAfterDays} days. Borrowing and auto-repay paused; exits open.`,
    status: 'warning',
  });
  return next;
}

export function setWrongNetworkState(state: SimState, wrong: boolean): SimState {
  const next = cloneState(state);
  next.network = wrong ? 'wrong' : 'testnet';
  addEvent(next, {
    type: 'rate',
    title: wrong ? 'Wrong network' : 'Network restored',
    detail: wrong
      ? 'The demo is on the wrong network. Actions are blocked until you switch back.'
      : 'Injective Testnet 1439 is selected again.',
    status: wrong ? 'warning' : 'info',
  });
  return next;
}

export function drainBufferState(state: SimState): SimState {
  const next = cloneState(state);
  next.bufferLst = 0n;
  addEvent(next, {
    type: 'rate',
    title: 'Swap buffer drained',
    detail: 'The simulated LST buffer is empty. Redemptions will queue.',
    status: 'warning',
  });
  return next;
}

export function fundBufferState(state: SimState, amount: bigint): SimState {
  let next = cloneState(state);
  next.bufferLst += amount;
  addEvent(next, {
    type: 'rate',
    title: 'Swap buffer funded',
    detail: `${amount / ONE} stINJ added to the simulated buffer.`,
    status: 'info',
  });
  next = processQueueState(next);
  return next;
}

export function setNextOutcomeState(state: SimState, outcome: TxOutcome): SimState {
  const next = cloneState(state);
  next.nextOutcome = outcome;
  return next;
}

export function setTxState(state: SimState, tx: TxState): SimState {
  const next = cloneState(state);
  next.tx = tx;
  return next;
}

export function toSnapshot(state: SimState, mode: Snapshot['mode']): Snapshot {
  const collateralValue = collateralValueOf(state);
  const maxDebt = maxDebtOf(state);
  const headroom = maxDebt > state.debtQinj ? maxDebt - state.debtQinj : 0n;
  const rateStatus = deriveRateStatus(state);
  const liquidationEligible = isLiquidationEligible(state);
  const paused = pausedMintsOf(state);
  const ltvBps = ltvBpsOf(state);
  const annualYield = mulDiv(collateralValue, BigInt(PROTOCOL_CONFIG.aprBps), 10_000n);
  const projectedMonthsToZero =
    state.debtQinj === 0n
      ? 0
      : annualYield === 0n
        ? null
        : Math.max(0, (Number(state.debtQinj) / Number(annualYield)) * 12);
  const healthPct =
    maxDebt === 0n
      ? state.debtQinj === 0n
        ? 100
        : 0
      : Math.max(0, Math.min(100, Number((headroom * 10_000n) / maxDebt) / 100));
  const queuedLst = state.redemptions
    .filter((redemption) => redemption.status === 'queued')
    .reduce((sum, redemption) => sum + redemption.lst, 0n);

  return {
    mode,
    connected: state.connected,
    network: state.network,
    chainId: state.network === 'testnet' ? 1439 : 1,
    account: {
      address: PROTOCOL_CONFIG.simulatedAddress,
      label: 'Simulated account',
      connected: state.connected,
    },
    position: {
      collateralLst: state.collateralLst,
      debtQinj: state.debtQinj,
      qinjBalance: state.qinjBalance,
      walletLst: state.walletLst,
    },
    metrics: {
      collateralValueInj: collateralValue,
      maxDebtInj: maxDebt,
      ltvBps,
      headroomInj: headroom,
      healthPct,
      yieldSinceHarvestInj: yieldSinceHarvestOf(state),
      projectedMonthsToZero,
    },
    rate: {
      value: state.rate,
      aprBps: PROTOCOL_CONFIG.aprBps,
      updatedAt: state.rateUpdatedAt,
      status: rateStatus,
      min: PROTOCOL_CONFIG.rateMin,
      max: PROTOCOL_CONFIG.rateMax,
    },
    protocol: {
      pausedMints: paused,
      pausedHarvest: paused,
      exitsOpen: state.network === 'testnet',
      liquidationEligible,
      liquidated: state.liquidated,
      bufferLst: state.bufferLst,
      queuedLst,
      bufferTargetLst: PROTOCOL_CONFIG.bufferTargetLst,
      badDebtInj: state.badDebtInj,
    },
    treasury: {
      qinj: state.treasuryQinj,
      lst: state.treasuryLst ?? 0n,
    },
    history: state.history.map((point) => ({ ...point })),
    events: state.events.map((event) => ({ ...event })),
    redemptions: state.redemptions.map((redemption) => ({ ...redemption })),
    tx: { ...state.tx },
    config: PROTOCOL_CONFIG,
    sources: SOURCES,
    ...(mode === 'simulated'
      ? {
          simulation: {
            now: state.now,
            nextOutcome: state.nextOutcome,
            initialWalletLst: PROTOCOL_CONFIG.initialWalletLst,
            initialBufferLst: PROTOCOL_CONFIG.initialBufferLst,
          },
        }
      : {}),
  };
}