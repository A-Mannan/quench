import { useState } from 'react';
import { CheckCircle, Clock, ListBullets, Warning } from '@phosphor-icons/react';
import { useQuench } from '../client';
import { formatAmount, formatDateTime, shortHash } from '../client/math';
import { PageHeader } from '../components/PageHeader';
import { Panel } from '../components/Panel';
import { Stat } from '../components/Stat';

type Filter = 'all' | 'position' | 'yield' | 'exit' | 'risk';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'position', label: 'Position' },
  { id: 'yield', label: 'Yield' },
  { id: 'exit', label: 'Exits' },
  { id: 'risk', label: 'Risk' },
];

function filterEvent(type: string, filter: Filter): boolean {
  if (filter === 'all') return true;
  if (filter === 'position') return ['deposit', 'mint', 'connect', 'withdraw'].includes(type);
  if (filter === 'yield') return type === 'harvest';
  if (filter === 'exit') return type === 'redeem';
  return type === 'rate' || type === 'liquidate' || type === 'queue';
}

export default function Activity() {
  const { snapshot } = useQuench();
  const [filter, setFilter] = useState<Filter>('all');
  const events = snapshot.events.filter((event) => filterEvent(event.type, filter)).slice().reverse();

  return (
    <div className="page">
      <PageHeader
        kicker="Activity"
        title="Every movement, in order."
        lede="The local ledger records simulated deposits, mints, harvests, redemptions, rate events and exits. Hashes are simulated; they do not resolve on an explorer."
        aside={
          <div className="page-head__aside-stack">
            <span className="mono page-head__aside-note">{snapshot.events.length} events</span>
            <span className="mono page-head__aside-note">local only</span>
          </div>
        }
      />

      <div className="activity-summary">
        <Stat
          label="Debt"
          value={formatAmount(snapshot.position.debtQinj, 2)}
          unit="qINJ"
          tone={snapshot.position.debtQinj > 0n ? 'danger' : 'success'}
        />
        <Stat
          label="Collateral"
          value={formatAmount(snapshot.position.collateralLst, 2)}
          unit="stINJ"
        />
        <Stat
          label="qINJ wallet"
          value={formatAmount(snapshot.position.qinjBalance, 2)}
          unit="qINJ"
        />
        <Stat
          label="Queued redemptions"
          value={formatAmount(snapshot.protocol.queuedLst, 2)}
          unit="stINJ"
          tone={snapshot.protocol.queuedLst > 0n ? 'danger' : 'default'}
        />
      </div>

      <Panel
        meta="Ledger"
        title="Simulated activity"
        action={
          <div className="filter-row" role="group" aria-label="Filter activity">
            {FILTERS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`filter-chip${filter === item.id ? ' is-active' : ''}`}
                aria-pressed={filter === item.id}
                onClick={() => setFilter(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        }
      >
        {events.length === 0 ? (
          <div className="ledger-empty ledger-empty--large">
            <ListBullets size={24} weight="regular" aria-hidden="true" />
            <p>No events match this filter. The ledger is local and starts empty.</p>
          </div>
        ) : (
          <div className="ledger-table-wrap">
            <table className="ledger-table">
              <caption className="sr-only">Simulated Quench activity</caption>
              <thead>
                <tr>
                  <th scope="col">Event</th>
                  <th scope="col">Amount</th>
                  <th scope="col">Status</th>
                  <th scope="col">When</th>
                  <th scope="col">Hash</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id}>
                    <td data-label="Event">
                      <span className={`ledger-status ledger-status--${event.status}`}>
                        {event.status === 'confirmed' ? (
                          <CheckCircle size={14} weight="fill" aria-hidden="true" />
                        ) : event.status === 'queued' ? (
                          <Clock size={14} weight="regular" aria-hidden="true" />
                        ) : (
                          <Warning size={14} weight="regular" aria-hidden="true" />
                        )}
                        {event.title}
                      </span>
                      <span className="ledger-table__detail">{event.detail}</span>
                    </td>
                    <td data-label="Amount">
                      {event.amount
                        ? `${formatAmount(event.amount, 2)} ${event.unit ?? ''}`
                        : '—'}
                    </td>
                    <td data-label="Status">
                      <span className={`tag tag--${event.status}`}>{event.status}</span>
                    </td>
                    <td data-label="When">{formatDateTime(event.at)}</td>
                    <td data-label="Hash">
                      <span className="mono ledger-table__hash">{shortHash(event.hash)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <div className="instrument-note instrument-note--wide">
        <div className="instrument-note__title">Simulation note</div>
        <p>
          No transaction was signed, broadcast or confirmed. Hash values are deterministic demo
          identifiers. The real integration will replace them with explorer links once the testnet
          contracts exist.
        </p>
      </div>
    </div>
  );
}