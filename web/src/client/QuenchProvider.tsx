import {
  createContext,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import type { QuenchClient, Snapshot } from './types';

interface QuenchContextValue {
  client: QuenchClient;
  snapshot: Snapshot;
}

const QuenchContext = createContext<QuenchContextValue | null>(null);

export function QuenchProvider({
  client,
  children,
}: {
  client: QuenchClient;
  children: ReactNode;
}) {
  const snapshot = useSyncExternalStore(
    client.subscribe,
    client.getSnapshot,
    client.getSnapshot,
  );

  return (
    <QuenchContext.Provider value={{ client, snapshot }}>
      {children}
    </QuenchContext.Provider>
  );
}

export function useQuench(): QuenchContextValue {
  const value = useContext(QuenchContext);
  if (!value) throw new Error('useQuench must be used inside QuenchProvider');
  return value;
}