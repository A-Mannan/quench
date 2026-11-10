export const ONE = 1_000_000_000_000_000_000n;
export const DAY_MS = 86_400_000;

export type Mode = 'simulated' | 'testnet';
export type Network = 'testnet' | 'wrong';
export type RateStatus = 'fresh' | 'stale' | 'out-of-bounds' | 'drop';
export type TxKind =
  | 'connect'
  | 'deposit'
  | 'mint'
  | 'loan'
  | 'repay'
  | 'harvest'
  | 'redeem'
  | 'withdraw'
  | 'self-liquidate'
  | 'liquidate';
export type TxStatus = 'idle' | 'pending' | 'confirmed' | 'failed' | 'rejected';
export type TxOutcome = 'success' | 'reject' | 'fail';
export type RedemptionStatus = 'queued' | 'paid';
export type EventStatus = 'confirmed' | 'queued' | 'info' | 'warning';

export interface TxState {
  kind: TxKind | null;
  status: TxStatus;
  message?: string;
  hash?: string;
}

export interface HistoryPoint {
  t: number;
  debt: bigint;
  collateralValue: bigint;
  rate: bigint;
  kind:
    | 'start'
    | 'deposit'
    | 'mint'
    | 'repay'
    | 'self-liquidate'
    | 'harvest'
    | 'redeem'
    | 'withdraw'
    | 'drop'
    | 'liquidate';
}

export interface ActivityEvent {
  id: string;
  type: TxKind | 'rate' | 'queue' | 'reset';
  at: number;
  title: string;
  detail: string;
  amount?: bigint;
  unit?: 'qINJ' | 'stINJ' | 'INJ';
  status: EventStatus;
  hash: string;
}

export interface Redemption {
  id: string;
  qinj: bigint;
  lst: bigint;
  requestedAt: number;
  unlockAt: number;
  status: RedemptionStatus;
}

export interface Source {
  id: string;
  label: string;
  value: string;
  source: string;
  url?: string;
  date: string;
  note: string;
  illustrative: boolean;
}

export interface ProtocolConfig {
  lstSymbol: string;
  lstName: string;
  qinjSymbol: string;
  aprBps: number;
  maxLtvBps: number;
  mintFeeBps: number;
  redeemFeeBps: number;
  redemptionDelayDays: number;
  staleAfterDays: number;
  rateMin: bigint;
  rateMax: bigint;
  initialRate: bigint;
  initialWalletLst: bigint;
  initialBufferLst: bigint;
  bufferTargetLst: bigint;
  liquidationPenaltyBps: number;
  simulationStart: number;
  simulatedAddress: string;
}

export interface Snapshot {
  mode: Mode;
  connected: boolean;
  network: Network;
  chainId: number;
  account: {
    address: string;
    label: string;
    connected: boolean;
  };
  position: {
    collateralLst: bigint;
    debtQinj: bigint;
    qinjBalance: bigint;
    walletLst: bigint;
  };
  metrics: {
    collateralValueInj: bigint;
    maxDebtInj: bigint;
    ltvBps: number;
    headroomInj: bigint;
    healthPct: number;
    yieldSinceHarvestInj: bigint;
    projectedMonthsToZero: number | null;
  };
  rate: {
    value: bigint;
    aprBps: number;
    updatedAt: number;
    status: RateStatus;
    min: bigint;
    max: bigint;
  };
  protocol: {
    pausedMints: boolean;
    pausedHarvest: boolean;
    exitsOpen: boolean;
    liquidationEligible: boolean;
    liquidated: boolean;
    bufferLst: bigint;
    queuedLst: bigint;
    bufferTargetLst: bigint;
    badDebtInj: bigint;
  };
  treasury: {
    qinj: bigint;
    lst: bigint;
  };
  history: HistoryPoint[];
  events: ActivityEvent[];
  redemptions: Redemption[];
  tx: TxState;
  config: ProtocolConfig;
  sources: Source[];
  simulation?: {
    now: number;
    nextOutcome: TxOutcome;
    initialWalletLst: bigint;
    initialBufferLst: bigint;
  };
}

export interface TxReceipt {
  hash: string;
  status: 'confirmed';
}

export interface SimulationApi {
  fastForward(days: number): Promise<void>;
  dropRate(bps: number): Promise<void>;
  spikeRate(bps: number): Promise<void>;
  makeStale(): Promise<void>;
  setWrongNetwork(value: boolean): Promise<void>;
  setNextOutcome(outcome: TxOutcome): Promise<void>;
  drainBuffer(): Promise<void>;
  fundBuffer(amount?: bigint): Promise<void>;
  triggerLiquidation(): Promise<void>;
  reset(): Promise<void>;
}

export interface QuenchClient {
  readonly mode: Mode;
  getSnapshot(): Snapshot;
  subscribe(listener: () => void): () => void;
  connect(): Promise<void>;
  refresh(): Promise<void>;
  deposit(amount: bigint): Promise<TxReceipt>;
  depositAndMint(depositAmount: bigint, amount: bigint): Promise<TxReceipt>;
  repay(amount: bigint): Promise<TxReceipt>;
  selfLiquidate(): Promise<TxReceipt>;
  mint(amount: bigint): Promise<TxReceipt>;
  harvest(): Promise<TxReceipt>;
  redeem(amount: bigint): Promise<TxReceipt>;
  withdraw(amount: bigint): Promise<TxReceipt>;
  readonly simulation?: SimulationApi;
}