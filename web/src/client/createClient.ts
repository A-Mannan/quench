import type { Mode, QuenchClient } from './types';

export async function createQuenchClient(): Promise<QuenchClient> {
  const mode: Mode =
    import.meta.env.VITE_QUENCH_MODE === 'testnet' ? 'testnet' : 'simulated';

  if (mode === 'testnet') {
    const { TestnetClient } = await import('./testnet/TestnetClient');
    return new TestnetClient();
  }

  const { SimulatedClient } = await import('./simulated/SimulatedClient');
  return new SimulatedClient();
}

export { FaultyClient } from './faulty/FaultyClient';