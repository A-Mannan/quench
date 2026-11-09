import { ButtonLink } from './Button';
import { Panel } from './Panel';
import { SimulatedBadge } from './SimulatedBadge';
import { Vessel } from './Vessel';

export function EmptyPosition() {
  return (
    <Panel className="empty-position" meta="No collateral · no debt" title="The Basin is empty">
      <div className="empty-position__grid">
        <div className="empty-position__diagram">
          <Vessel
            fillPct={0}
            label="Basin collateral"
            value={0n}
            unit="stINJ"
            sublabel="Empty — no pressure"
          />
        </div>
        <div className="empty-position__copy">
          <p>
            Deposit stINJ to pressurise the vessel. Then mint qINJ against it. Nothing moves until
            you choose an amount, and every consequence is shown before the button is enabled.
          </p>
          <div className="empty-position__actions">
            <ButtonLink to="/app/basin" size="lg">
              Deposit stINJ
            </ButtonLink>
            <SimulatedBadge compact />
          </div>
        </div>
      </div>
    </Panel>
  );
}
