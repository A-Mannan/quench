export function SimulatedBadge({ compact = false }: { compact?: boolean }) {
  return (
    <span
      className={`sim-badge${compact ? ' sim-badge--compact' : ''}`}
      data-testid="sim-badge"
      title="Simulated demo. No contracts, wallet keys or funds are involved."
    >
      <span className="sim-badge__dot" aria-hidden="true" />
      <span className="sim-badge__text">Simulated · contracts not deployed</span>
    </span>
  );
}