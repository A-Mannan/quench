import { ArrowDown } from '@phosphor-icons/react';

const STEPS = [
  {
    number: '01',
    title: 'Deposit',
    body: 'Deposit stINJ as collateral. Its value comes from the staking rate, not a DEX.',
  },
  {
    number: '02',
    title: 'Borrow',
    body: 'Borrow qINJ up to half the collateral value. The borrow fee leaves stINJ collateral.',
  },
  {
    number: '03',
    title: 'Cool',
    body: 'Quench uses qINJ from your wallet to repay the debt as the exchange rate rises.',
  },
  {
    number: '04',
    title: 'Exit',
    body: 'Swap qINJ for stINJ, or withdraw collateral once debt is zero.',
  },
];

function Fragment({ index }: { index: number }) {
  if (index === 0) {
    return (
      <div className="circuit__fragment" aria-hidden="true">
        <div className="circuit__reading">
          <strong>150.00</strong>
          <span>stINJ</span>
        </div>
        <div className="circuit__fragment-foot">
          <span>Collateral</span>
          <span>collateral</span>
        </div>
      </div>
    );
  }

  if (index === 1) {
    return (
      <div className="circuit__fragment" aria-hidden="true">
        <div className="circuit__reading">
          <strong>50.00</strong>
          <span>qINJ</span>
        </div>
        <div className="circuit__fragment-foot">
          <span>33.3% LTV</span>
          <span>max 50%</span>
        </div>
      </div>
    );
  }

  if (index === 2) {
    return (
      <div className="circuit__fragment" aria-hidden="true">
        <div className="circuit__reading">
          <strong>0.94</strong>
          <span>qINJ / mo</span>
        </div>
        <svg className="circuit__spark" viewBox="0 0 160 28" preserveAspectRatio="none">
          <path
            d="M0 5 22 8 44 10 66 14 88 17 110 21 132 24 160 26"
            fill="none"
            stroke="var(--accent-text)"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <div className="circuit__fragment-foot">
          <span>APR / 7.53%</span>
          <span>debt falls</span>
        </div>
      </div>
    );
  }

  return (
    <div className="circuit__fragment" aria-hidden="true">
      <div className="circuit__reading">
        <strong>≤7</strong>
        <span>days</span>
      </div>
      <div className="circuit__flow">
        <b>qINJ</b>
        <i>→</i>
        <b>buffer</b>
        <i>→</i>
        <b>stINJ</b>
      </div>
      <div className="circuit__fragment-foot">
        <span>Swap</span>
        <span>about 7 days</span>
      </div>
    </div>
  );
}

export function LoopDiagram() {
  return (
    <div className="circuit">
      <div className="circuit__rail" aria-hidden="true">
        <span className="circuit__pulse" />
      </div>
      <ol className="circuit__steps" aria-label="The Quench loop, four steps">
        {STEPS.map((step, index) => (
          <li className="circuit__step" key={step.number}>
            <div className="circuit__node">{step.number}</div>
            <h3 className="circuit__title">{step.title}</h3>
            <p className="circuit__body">{step.body}</p>
            <Fragment index={index} />
          </li>
        ))}
      </ol>
      <div className="circuit__return">
        <span className="circuit__return-arrow" aria-hidden="true">
          ←
        </span>
        <span className="circuit__return-rule" aria-hidden="true" />
        <span className="circuit__return-label">The circuit closes at zero debt</span>
        <a className="text-link" href="#curve">
          Test the curve
          <ArrowDown size={14} weight="bold" aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}
