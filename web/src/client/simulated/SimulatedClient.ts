import { PROTOCOL_CONFIG } from '../config';
import type {
  QuenchClient,
  SimulationApi,
  Snapshot,
  TxKind,
  TxReceipt,
} from '../types';
import {
  connectState,
  createInitialState,
  depositState,
  drainBufferState,
  dropRateState,
  fastForwardState,
  fundBufferState,
  harvestState,
  liquidateState,
  makeStaleState,
  mintState,
  redeemState,
  setNextOutcomeState,
  setTxState,
  setWrongNetworkState,
  spikeRateState,
  toSnapshot,
  withdrawState,
  type SimState,
} from './engine';

const STORAGE_KEY = 'quench.demo.v1';
const BIGINT_KEY = '__quenchBigInt';
const LATENCY =
  typeof process !== 'undefined' && process.env?.VITEST
    ? 0
    : import.meta.env.MODE === 'test'
      ? 0
      : 480;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function replacer(_key: string, value: unknown): unknown {
  if (typeof value === 'bigint') {
    return { [BIGINT_KEY]: value.toString() };
  }
  return value;
}

function reviver(_key: string, value: unknown): unknown {
  if (
    value !== null &&
    typeof value === 'object' &&
    BIGINT_KEY in (value as Record<string, unknown>)
  ) {
    const raw = (value as Record<string, unknown>)[BIGINT_KEY];
    if (typeof raw === 'string') return BigInt(raw);
  }
  return value;
}

function loadState(): SimState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialState();
    const parsed = JSON.parse(raw, reviver) as SimState;
    if (
      parsed?.version !== 1 ||
      typeof parsed.now !== 'number' ||
      !Array.isArray(parsed.history) ||
      !Array.isArray(parsed.events)
    ) {
      return createInitialState();
    }
    return { ...parsed, tx: { kind: null, status: 'idle' } };
  } catch {
    return createInitialState();
  }
}

function persist(state: SimState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state, replacer));
  } catch {
    // The demo still works if storage is unavailable.
  }
}

export class SimulatedClient implements QuenchClient {
  readonly mode = 'simulated' as const;
  readonly simulation: SimulationApi;
  private state: SimState;
  private snapshot: Snapshot;
  private listeners = new Set<() => void>();

  constructor() {
    this.state = loadState();
    this.snapshot = toSnapshot(this.state, 'simulated');
    this.simulation = {
      fastForward: async (days: number) => {
        await delay(140);
        this.commit(fastForwardState(this.state, days));
      },
      dropRate: async (bps: number) => {
        await delay(140);
        this.commit(dropRateState(this.state, bps));
      },
      spikeRate: async (bps: number) => {
        await delay(140);
        this.commit(spikeRateState(this.state, bps));
      },
      makeStale: async () => {
        await delay(140);
        this.commit(makeStaleState(this.state));
      },
      setWrongNetwork: async (value: boolean) => {
        await delay(140);
        this.commit(setWrongNetworkState(this.state, value));
      },
      setNextOutcome: async (outcome) => {
        await delay(80);
        this.commit(setNextOutcomeState(this.state, outcome));
      },
      drainBuffer: async () => {
        await delay(140);
        this.commit(drainBufferState(this.state));
      },
      fundBuffer: async (amount?: bigint) => {
        await delay(140);
        this.commit(fundBufferState(this.state, amount ?? PROTOCOL_CONFIG.initialBufferLst));
      },
      triggerLiquidation: async () => {
        await this.transact('liquidate', liquidateState);
      },
      reset: async () => {
        await delay(120);
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {
          // ignore storage failures
        }
        this.commit(createInitialState());
      },
    };
  }

  getSnapshot = (): Snapshot => this.snapshot;

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  private emit(): void {
    for (const listener of this.listeners) listener();
  }

  private commit(next: SimState): void {
    this.state = next;
    this.snapshot = toSnapshot(next, 'simulated');
    persist(next);
    this.emit();
  }

  private async transact(
    kind: TxKind,
    fn: (state: SimState) => SimState,
  ): Promise<TxReceipt> {
    this.commit(setTxState(this.state, { kind, status: 'pending' }));
    await delay(LATENCY);

    const outcome = this.state.nextOutcome;
    if (outcome === 'reject') {
      this.commit(
        setTxState(this.state, {
          kind,
          status: 'rejected',
          message: 'Rejected in the simulated wallet. Nothing moved.',
        }),
      );
      throw new Error('Transaction rejected in the simulated wallet.');
    }
    if (outcome === 'fail') {
      this.commit(
        setTxState(this.state, {
          kind,
          status: 'failed',
          message: 'The simulated transaction failed before confirmation.',
        }),
      );
      throw new Error('Simulated transaction failed.');
    }

    try {
      const next = fn(this.state);
      const latest = next.events[next.events.length - 1];
      const hash = latest?.hash ?? `0x${'0'.repeat(64)}`;
      this.commit(setTxState(next, { kind, status: 'confirmed', hash }));
      return { hash, status: 'confirmed' };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Simulated transaction failed.';
      this.commit(setTxState(this.state, { kind, status: 'failed', message }));
      throw error;
    }
  }

  async connect(): Promise<void> {
    if (this.state.connected) return;
    await this.transact('connect', connectState);
  }

  async refresh(): Promise<void> {
    await delay(120);
  }

  async deposit(amount: bigint): Promise<TxReceipt> {
    return this.transact('deposit', (state) => depositState(state, amount));
  }

  async mint(amount: bigint): Promise<TxReceipt> {
    return this.transact('mint', (state) => mintState(state, amount));
  }

  async harvest(): Promise<TxReceipt> {
    return this.transact('harvest', harvestState);
  }

  async redeem(amount: bigint): Promise<TxReceipt> {
    return this.transact('redeem', (state) => redeemState(state, amount));
  }

  async withdraw(amount: bigint): Promise<TxReceipt> {
    return this.transact('withdraw', (state) => withdrawState(state, amount));
  }
}