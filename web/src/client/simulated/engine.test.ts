import { describe, expect, it } from 'vitest';
import { PROTOCOL_CONFIG } from '../config';
import { ONE } from '../types';
import {
  collateralValueOf,
  createInitialState,
  depositState,
  drainBufferState,
  dropRateState,
  fastForwardState,
  fundBufferState,
  harvestState,
  isLiquidationEligible,
  liquidateState,
  makeStaleState,
  maxDebtOf,
  mintState,
  pausedMintsOf,
  redeemState,
  setWrongNetworkState,
  toSnapshot,
  withdrawState,
} from './engine';

function withPosition(collateral = 100n, debt = 20n) {
  let state = createInitialState();
  state = depositState(state, collateral * ONE);
  state = mintState(state, debt * ONE);
  return state;
}

describe('fixed-point engine', () => {
  it('mints qINJ, charges the collateral fee and respects the LTV bound', () => {
    let state = createInitialState();
    state = depositState(state, 100n * ONE);
    state = mintState(state, 49n * ONE);

    expect(state.debtQinj).toBe(49n * ONE);
    expect(state.qinjBalance).toBe(49n * ONE);
    expect(state.treasuryQinj).toBe(0n);
    expect(state.treasuryLst).toBe(245_000_000_000_000_000n);
    expect(state.debtQinj).toBeLessThanOrEqual(maxDebtOf(state));
  });

  it('blocks a mint above maxLTV', () => {
    let state = createInitialState();
    state = depositState(state, 100n * ONE);
    expect(() => mintState(state, 50n * ONE)).toThrow(/maximum LTV/);
  });

  it('burns qINJ from the wallet and reduces debt by the same value', () => {
    let state = withPosition(100n, 20n);
    const debtBefore = state.debtQinj;
    const qinjBefore = state.qinjBalance;
    state = fastForwardState(state, 365);

    expect(state.debtQinj).toBeLessThan(debtBefore);
    expect(state.qinjBalance).toBeLessThan(qinjBefore);
    expect(debtBefore - state.debtQinj).toBe(qinjBefore - state.qinjBalance);
  });

  it('never lets rounding favour the user on redemption', () => {
    let state = withPosition(100n, 10n);
    const qinjBefore = state.qinjBalance;
    state = redeemState(state, 1n);
    const qinjBurned = qinjBefore - state.qinjBalance;
    const fee = (qinjBurned * BigInt(PROTOCOL_CONFIG.redeemFeeBps)) / 10_000n;
    const net = qinjBurned - fee;
    const lstOut = (net * ONE) / state.rate;
    expect((lstOut * state.rate) / ONE).toBeLessThanOrEqual(net);
  });

  it('keeps debt non-negative over a long horizon', () => {
    let state = withPosition(200n, 90n);
    state = fastForwardState(state, 3_650);
    expect(state.debtQinj).toBeGreaterThanOrEqual(0n);
  });

  it('conserves deposits between wallet and Basin', () => {
    let state = createInitialState();
    const walletBefore = state.walletLst;
    state = depositState(state, 100n * ONE);
    expect(state.walletLst + state.collateralLst).toBe(walletBefore);
    state = withdrawState(state, 40n * ONE);
    expect(state.walletLst + state.collateralLst).toBe(walletBefore);
  });

  it('routes a rate drop into liquidation eligibility and pauses entries', () => {
    let state = withPosition(100n, 49n);
    state = dropRateState(state, 6_000);
    expect(isLiquidationEligible(state)).toBe(true);
    expect(pausedMintsOf(state)).toBe(true);
    expect(() => withdrawState(state, ONE)).toThrow(/zero debt/);
    expect(() => mintState(state, ONE)).toThrow(/paused/);

    const redeemed = redeemState(state, 5n * ONE);
    expect(redeemed.qinjBalance).toBeLessThan(state.qinjBalance);

    const liquidated = liquidateState(state);
    expect(liquidated.debtQinj).toBe(0n);
    expect(liquidated.badDebtInj).toBeGreaterThan(0n);
    expect(liquidated.liquidated).toBe(true);
  });

  it('pauses mints and harvest on a stale rate but keeps redemption open', () => {
    let state = withPosition(100n, 20n);
    state = makeStaleState(state);
    expect(() => mintState(state, ONE)).toThrow(/stale/);
    expect(() => harvestState(state)).toThrow(/stale/);
    const afterRedeem = redeemState(state, 1n * ONE);
    expect(afterRedeem.qinjBalance).toBeLessThan(state.qinjBalance);
  });

  it('allows withdrawal at zero debt even when the rate is stale', () => {
    let state = withPosition(100n, 10n);
    state = fastForwardState(state, 3_650);
    state = makeStaleState(state);
    expect(state.debtQinj).toBe(0n);
    const walletBefore = state.walletLst;
    const collateralBefore = state.collateralLst;
    state = withdrawState(state, collateralBefore);
    expect(state.walletLst).toBe(walletBefore + collateralBefore);
    expect(state.collateralLst).toBe(0n);
  });

  it('queues a redemption when the buffer is empty and pays after the delay', () => {
    let state = withPosition(100n, 20n);
    state = drainBufferState(state);
    state = redeemState(state, 5n * ONE);
    expect(state.redemptions).toHaveLength(1);
    expect(state.redemptions[0]?.status).toBe('queued');
    expect(state.bufferLst).toBe(0n);

    state = fundBufferState(state, 500n * ONE);
    expect(state.redemptions[0]?.status).toBe('queued');
    state = fastForwardState(state, PROTOCOL_CONFIG.redemptionDelayDays + 1);
    expect(state.redemptions[0]?.status).toBe('paid');
    expect(state.walletLst).toBeGreaterThan(0n);
  });

  it('blocks all actions on the wrong network', () => {
    let state = withPosition(100n, 20n);
    state = setWrongNetworkState(state, true);
    expect(() => depositState(state, ONE)).toThrow(/Wrong network/);
    expect(() => redeemState(state, ONE)).toThrow(/Wrong network/);
    expect(() => withdrawState(state, ONE)).toThrow(/Wrong network/);
  });

  it('reports healthy headroom and a repayment projection', () => {
    const state = withPosition(100n, 20n);
    const snapshot = toSnapshot(state, 'simulated');
    expect(snapshot.metrics.collateralValueInj).toBe(collateralValueOf(state));
    expect(snapshot.metrics.maxDebtInj).toBe(maxDebtOf(state));
    expect(snapshot.metrics.headroomInj).toBe(maxDebtOf(state) - 20n * ONE);
    expect(snapshot.metrics.healthPct).toBeCloseTo(59.96, 1);
    expect(snapshot.metrics.projectedMonthsToZero).toBeGreaterThan(0);
    expect(snapshot.protocol.pausedMints).toBe(false);
  });
});