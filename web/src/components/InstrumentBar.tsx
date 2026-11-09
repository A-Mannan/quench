export function InstrumentBar({ crumb, chainId }: { crumb: string; chainId: number }) {
  return (
    <>
      <div className="instrument-bar">
        <span className="instrument-bar__app">Quench</span>
        <span className="instrument-bar__crumb">{crumb}</span>
        <span className="instrument-bar__net">Testnet {chainId}</span>
      </div>
      <div className="instrument-ruler" aria-hidden="true" />
    </>
  );
}
