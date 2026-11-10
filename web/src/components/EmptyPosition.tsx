import { useQuench } from '../client';
import { ButtonLink } from './Button';
import { InstrumentBar } from './InstrumentBar';

export function EmptyPosition() {
  const { snapshot } = useQuench();
  return (
    <section className="card empty-simple">
      <InstrumentBar crumb="Loans" chainId={snapshot.chainId} />
      <h2>The Basin is empty</h2>
      <p className="muted">Deposit stINJ to borrow qINJ. No liquidation risk.</p>
      <ButtonLink to="/app/loans" full size="lg">
        Add collateral &amp; borrow
      </ButtonLink>
    </section>
  );
}
