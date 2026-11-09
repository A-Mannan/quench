import { PROTOCOL_CONFIG, SOURCES } from './config';
import type { Mode, Snapshot } from './types';

export function emptySnapshot(mode: Mode, connected = false): Snapshot {
  const now = PROTOCOL_CONFIG.simulationStart;
  return {
    mode,
    connected,
    network: 'testnet',
    chainId: 1439,
    account: {
      address: PROTOCOL_CONFIG.simulatedAddress,
      label: mode === 'testnet' ? 'No wallet connected' : 'Simulated account',
      connected,
    },
    position: {
      collateralLst: 0n,
      debtQinj: 0n,
      qinjBalance: 0n,
      walletLst: mode === 'simulated' ? PROTOCOL_CONFIG.initialWalletLst : 0n,
    },
    metrics: {
      collateralValueInj: 0n,
      maxDebtInj: 0n,
      ltvBps: 0,
      headroomInj: 0n,
      healthPct: 100,
      yieldSinceHarvestInj: 0n,
      projectedMonthsToZero: null,
    },
    rate: {
      value: PROTOCOL_CONFIG.initialRate,
      aprBps: PROTOCOL_CONFIG.aprBps,
      updatedAt: now,
      status: 'fresh',
      min: PROTOCOL_CONFIG.rateMin,
      max: PROTOCOL_CONFIG.rateMax,
    },
    protocol: {
      pausedMints: false,
      pausedHarvest: false,
      exitsOpen: true,
      liquidationEligible: false,
      liquidated: false,
      bufferLst: mode === 'simulated' ? PROTOCOL_CONFIG.initialBufferLst : 0n,
      queuedLst: 0n,
      bufferTargetLst: PROTOCOL_CONFIG.bufferTargetLst,
      badDebtInj: 0n,
    },
    treasury: { qinj: 0n, lst: 0n },
    history: [],
    events: [],
    redemptions: [],
    tx: { kind: null, status: 'idle' },
    config: PROTOCOL_CONFIG,
    sources: SOURCES,
    ...(mode === 'simulated'
      ? {
          simulation: {
            now,
            nextOutcome: 'success' as const,
            initialWalletLst: PROTOCOL_CONFIG.initialWalletLst,
            initialBufferLst: PROTOCOL_CONFIG.initialBufferLst,
          },
        }
      : {}),
  };
}