import { useState } from 'react';
import { CheckCircle, Clock, Warning } from '@phosphor-icons/react';
import { useQuench } from '../client';
import { formatAmount, formatDateTime, shortHash } from '../client/math';
import { InstrumentBar } from '../components/InstrumentBar';

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
  if (filter === 'yield') return type === 'harvest' || type === 'repay';
  if (filter === 'exit') return type === 'redeem' || type === 'self-liquidate';
  return type === 'rate' || type === 'liquidate' || type === 'queue';
}

export default function Activity() {
  const { snapshot } = useQuench();
  const [filter, setFilter] = useState<Filter>('all');
  const events = snapshot.events.filter((event) => filterEvent(event.type, filter)).slice().reverse();

  return (
    <div className="page-simple">
      <div className="simple-head">
        <h1>Simulated activity</h1>
        <p>{snapshot.events.length} events · local only</p>
      </div>

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

      <section className="card" aria-label="Simulated activity">
        <InstrumentBar crumb="Activity" chainId={snapshot.chainId} />
        {events.length === 0 ? (
          <p className="muted">No events yet.</p>
        ) : (
          <ul className="simple-list simple-list--activity">
            {events.map((event) => (
              <li key={event.id}>
                <span className="activity-dot">
                  {event.status === 'confirmed' ? (
                    <CheckCircle size={14} weight="fill" aria-hidden="true" />
                  ) : event.status === 'queued' ? (
                    <Clock size={14} aria-hidden="true" />
                  ) : (
                    <Warning size={14} aria-hidden="true" />
                  )}
                  {event.title}
                </span>
                <span className="muted-inline">
                  {event.amount ? `${formatAmount(event.amount, 2)} ${event.unit ?? ''} · ` : ''}
                  {formatDateTime(event.at)} · {shortHash(event.hash)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
