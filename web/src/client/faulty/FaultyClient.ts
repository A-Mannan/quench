import type {
  QuenchClient,
  Snapshot,
  TxReceipt,
  TxState,
} from '../types';
import { emptySnapshot } from '../emptySnapshot';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class FaultyClient implements QuenchClient {
  readonly mode = 'simulated' as const;
  private snapshot: Snapshot;
  private listeners = new Set<() => void>();

  constructor() {
    this.snapshot = emptySnapshot('simulated', true);
  }

  getSnapshot = (): Snapshot => this.snapshot;

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  private emit(): void {
    for (const listener of this.listeners) listener();
  }

  private async fail(kind: TxState['kind'], message: string): Promise<never> {
    this.snapshot = {
      ...this.snapshot,
      tx: { kind, status: 'failed', message },
    };
    this.emit();
    await delay(10);
    throw new Error(message);
  }

  async connect(): Promise<void> {
    await this.fail('connect', 'Simulated wallet refused the connection.');
  }

  async refresh(): Promise<void> {
    await this.fail(null, 'Simulated RPC does not answer.');
  }

  async deposit(_amount: bigint): Promise<TxReceipt> {
    return this.fail('deposit', 'Simulated deposit failed before it reached the Basin.');
  }

  async mint(_amount: bigint): Promise<TxReceipt> {
    return this.fail('mint', 'Simulated mint failed at the rate check.');
  }

  async harvest(): Promise<TxReceipt> {
    return this.fail('harvest', 'Simulated harvest failed: the rate feed did not respond.');
  }

  async redeem(_amount: bigint): Promise<TxReceipt> {
    return this.fail('redeem', 'Simulated redemption failed: the buffer did not respond.');
  }

  async withdraw(_amount: bigint): Promise<TxReceipt> {
    return this.fail('withdraw', 'Simulated withdrawal failed at the exit check.');
  }
}