import type { ProtocolConfig, Source } from './types';

const DAY = 86_400_000;

/**
 * Every financial number in the UI comes from this module.
 * None of these values is a production parameter. Read the Sources drawer.
 */
export const PROTOCOL_CONFIG: ProtocolConfig = {
  lstSymbol: 'stINJ',
  lstName: 'Staked INJ (simulated)',
  qinjSymbol: 'qINJ',
  aprBps: 753,
  maxLtvBps: 5_000,
  mintFeeBps: 50,
  redeemFeeBps: 50,
  redemptionDelayDays: 7,
  staleAfterDays: 7,
  rateMin: 850_000_000_000_000_000n,
  rateMax: 2_500_000_000_000_000_000n,
  initialRate: 1_000_000_000_000_000_000n,
  initialWalletLst: 250_000_000_000_000_000_000n,
  initialBufferLst: 500_000_000_000_000_000_000n,
  bufferTargetLst: 750_000_000_000_000_000_000n,
  liquidationPenaltyBps: 500,
  simulationStart: Date.UTC(2026, 10, 9, 0, 0, 0),
  simulatedAddress: '0x0000000000000000000000000000000000005eED',
};

export const SOURCES: Source[] = [
  {
    id: 'apr',
    label: 'INJ staking APR',
    value: '7.53% APY',
    source: 'Staking Rewards — Injective',
    url: 'https://stakingrewards.com/asset/injective-protocol',
    date: '2026-11-09',
    note: 'Displayed headline rate at fetch time. It changes; the simulation treats it as a scenario assumption, not a promise.',
    illustrative: false,
  },
  {
    id: 'max-ltv',
    label: 'Maximum LTV',
    value: '50.00%',
    source: '[DECISION: illustrative]',
    date: '2026-11-09',
    note: 'A conservative demo bound. The protocol build must set this by simulation, not by copying a demo.',
    illustrative: true,
  },
  {
    id: 'mint-fee',
    label: 'Mint fee',
    value: '0.50%',
    source: '[DECISION: illustrative]',
    date: '2026-11-09',
    note: 'Taken from Basin collateral in LST; debt equals the qINJ minted.',
    illustrative: true,
  },
  {
    id: 'redeem-fee',
    label: 'Redeem fee',
    value: '0.50%',
    source: '[DECISION: illustrative]',
    date: '2026-11-09',
    note: 'Kept in the Confluence buffer; the user receives the net LST amount.',
    illustrative: true,
  },
  {
    id: 'redemption-delay',
    label: 'Redemption worst case',
    value: '7 days',
    source: '[DECISION: illustrative]',
    date: '2026-11-09',
    note: 'A queued redemption waits at most this long in the demo. It never waits on Injective’s 21-day unbonding.',
    illustrative: true,
  },
  {
    id: 'buffer',
    label: 'Confluence buffer',
    value: '500 stINJ',
    source: '[DECISION: illustrative]',
    date: '2026-11-09',
    note: 'A simulated protocol-owned LST reserve, not a claim about production liquidity.',
    illustrative: true,
  },
  {
    id: 'wallet',
    label: 'Simulated wallet',
    value: '250 stINJ',
    source: '[DECISION: illustrative]',
    date: '2026-11-09',
    note: 'Starting balance for the demo only. No real funds are involved.',
    illustrative: true,
  },
  {
    id: 'chain',
    label: 'Network',
    value: 'Injective EVM testnet · 1439',
    source: 'Injective docs — EVM network information',
    url: 'https://docs.injective.network/developers-evm/network-information',
    date: '2026-11-09',
    note: 'The UI is testnet-only. The demo does not connect to this network.',
    illustrative: false,
  },
];

export const RATE_BOUNDS = {
  min: PROTOCOL_CONFIG.rateMin,
  max: PROTOCOL_CONFIG.rateMax,
};

export const REDEMPTION_DELAY_MS = PROTOCOL_CONFIG.redemptionDelayDays * DAY;
export const STALE_AFTER_MS = PROTOCOL_CONFIG.staleAfterDays * DAY;

export const LST_DECIMALS = 18;
export const QINJ_DECIMALS = 18;