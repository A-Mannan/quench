import { createContext, useContext, useState, type ReactNode } from 'react';
import { ArrowUpRight } from '@phosphor-icons/react';
import { useQuench } from '../client';
import { Drawer } from './Drawer';

const SourcesContext = createContext<(() => void) | null>(null);

export function useSources(): () => void {
  const open = useContext(SourcesContext);
  if (!open) throw new Error('useSources must be used inside SourcesProvider');
  return open;
}

export function SourcesProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { snapshot } = useQuench();

  return (
    <SourcesContext.Provider value={() => setOpen(true)}>
      {children}
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Sources & assumptions"
        eyebrow="The numbers behind the demo"
        side="right"
        testId="sources-drawer"
      >
        <p className="drawer__lede">
          Every financial value in this demo comes from one config module. A URL means it was
          fetched; an illustrative tag means it is a demo assumption, not a protocol parameter.
        </p>
        <div className="source-list">
          {snapshot.sources.map((source) => (
            <div className="source" key={source.id}>
              <div className="source__top">
                <span className="source__label">{source.label}</span>
                <span className="source__value">{source.value}</span>
              </div>
              <div className="source__meta">
                <span>{source.source}</span>
                <span>{source.date}</span>
                {source.illustrative ? <span className="tag tag--warn">illustrative</span> : null}
              </div>
              <p className="source__note">{source.note}</p>
              {source.url ? (
                <a className="source__link" href={source.url} target="_blank" rel="noreferrer">
                  Open source <ArrowUpRight size={14} weight="bold" aria-hidden="true" />
                </a>
              ) : null}
            </div>
          ))}
        </div>
        <div className="drawer__note">
          No ABI, contract address, TVL, user count, audit or partner is invented in this demo.
          The only rate with an external source is the staking APR; it is a scenario assumption.
        </div>
      </Drawer>
    </SourcesContext.Provider>
  );
}