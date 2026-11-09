import type {
  QuenchClient,
  Snapshot,
  TxReceipt,
} from '../types';
import { emptySnapshot } from '../emptySnapshot';

const NOT_WIRED =
  'Testnet contracts are not wired in this change. No address or ABI has been invented. The demo is simulated.';

export class TestnetClient implements QuenchClient {
  readonly mode = 'testnet' as const;
  private snapshot = emptySnapshot('testnet', false);
  private listeners = new Set<() => void>();

  getSnapshot = (): Snapshot => this.snapshot;

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  private emit(): void {
    for (const listener of this.listeners) listener();
  }

  async connect(): Promise<void> {
    throw new Error(NOT_WIRED);
  }

  async refresh(): Promise<void> {
    throw new Error(NOT_WIRED);
  }

  async deposit(_amount: bigint): Promise<TxReceipt> {
    throw new Error(NOT_WIRED);
  }

  async mint(_amount: bigint): Promise<TxReceipt> {
    throw new Error(NOT_WIRED);
  }

  async harvest(): Promise<TxReceipt> {
    throw new Error(NOT_WIRED);
  }

  async redeem(_amount: bigint): Promise<TxReceipt> {
    throw new Error(NOT_WIRED);
  }

  async withdraw(_amount: bigint): Promise<TxReceipt> {
    throw new Error(NOT_WIRED);
  }

  failWith(): string {
    this.emit();
    return NOT_WIRED;
  }
}