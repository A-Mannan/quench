# Design: build-quench-demo-ui

## Context

See `proposal.md` for why. The protocol change `build-quench-mvp` is paused; this change ships only `web/` and frontend docs. The demo must make the BRIEF loop legible before contracts exist, while giving the future integration a typed seam rather than a prototype to rewrite.

Constraints:

- Fixed names: Quench, qINJ, Basin, Wellspring, Confluence, QNCH (QNCH is not surfaced in this UI except as a footer note; it has no app behaviour).
- No wallet or chain library. No backend. No real keys or funds. Testnet only.
- All integrations are simulated; every simulated view and screenshot carries "Simulated · contracts not deployed".
- The UI must not invent an ABI, contract address, TVL, users, audits, partners or testimonials.
- The design must pass the swap test and the Awwwards/accessibility evidence requirements in `docs/DESIGN.md`.

## Goals / Non-Goals

**Goals:**

- Every BRIEF flow and every required state is reachable in the UI.
- A single `QuenchClient` interface is the only integration surface the UI imports.
- The simulation is transparent: parameters, sources, assumptions and consequences are visible.
- The landing page states the loop in ≤20 words in the first viewport and shows debt falling.
- The app is production-grade at 375/768/1440 px, keyboard-operable, reduced-motion safe and fast enough to measure.

**Non-Goals:**

- Real wallet connection, real RPC, contract calls, ABIs, addresses or deployment.
- Mainnet, leverage loops, multi-collateral, QNCH governance, a backend or analytics.
- Production audit, legal review, or claims of award eligibility.
- Copying Alchemix visuals, copy, code or parameters.

## Decisions

### D1 — Vite + React + TypeScript static SPA

`[DECISION]` Use Vite 8, React 19 and TypeScript strict. Rationale: no server or SEO requirement for an app shell, a small static artifact, fast local iteration, and route-level code splitting. Alternatives: Next.js (server features unused, larger surface); plain HTML (stateful flows and tests would be harder to maintain).

### D2 — Custom CSS design system, no component library

`[DECISION]` Build tokens and components in native CSS with CSS variables. Rationale: the "Cooling Ledger" identity is custom; a UI kit would import a default look and bundle weight. Alternatives: Tailwind (utility churn for a one-app system); Radix/shadcn (unnecessary runtime for a small component set). Accessibility primitives are implemented directly (focus management, dialog, disclosures) and tested.

### D3 — "Cooling Ledger" identity

`[DECISION]` Mineral cool-neutral field, coolant teal accent, heat rust as semantic danger, Anybody + Public Sans + IBM Plex Mono, chamfered instrument panels, custom pressure curve. Rationale and rejected alternatives are in `docs/DESIGN.md`. The swap test is explicit: the interface must not read as generic DeFi if the wordmark is hidden.

### D4 — QuenchClient seam with three implementations

`[DECISION]` Define a typed domain interface (`QuenchClient`) with bigint fixed-point amounts and snapshot subscriptions. `SimulatedClient` implements the full demo; `TestnetClient` is a stub that throws a clear "not wired in this change" error; `FaultyClient` throws deterministic errors for tests. `createQuenchClient()` selects by `import.meta.env.VITE_QUENCH_MODE` (`simulated | testnet`). UI components import only the interface and the provider hook; they never import a concrete client.

Alternatives: components calling a mock module directly (forces rewrite at integration); a generic "web3 provider" abstraction (invents an ABI and hides domain semantics); URL-param client switching (keeps simulation code in the testnet bundle).

### D5 — Simulated accounting model

`[DECISION: illustrative]` The demo uses one LST (`stINJ`), one synthetic (`qINJ`), and a fixed-point 1e18 model:

- Collateral is valued at `collateralLst × exchangeRate / 1e18`; debt is qINJ, INJ-denominated.
- Wellspring harvest derives yield only from the exchange-rate delta. It burns qINJ **from the connected wallet** against the debt, up to the wallet balance. This keeps supply and debt coherent in the demo. If qINJ has been moved out, automatic repayment is limited; the UI discloses this.
- Confluence pays from a simulated LST buffer. If the buffer is insufficient, the redemption is queued and the worst-case delay is shown. The buffer is a demo liquidity reserve, not a claim about production liquidity.
- Mint fee is taken from Basin collateral in LST; debt equals the qINJ minted, so supply and debt stay aligned. Redeem fee stays in the buffer. Parameters are in one config file.
- The model is a scenario, not a forecast. All values are labelled simulated.

Alternatives: a debt token that is not burned (breaks supply/backing); a market buyback (invents a DEX); no buffer (redemption always queues, so the happy path is not demonstrable).

### D6 — Illustrative parameters with visible sources

`[DECISION: illustrative]` APR 7.53% (Staking Rewards, fetched 2026-11-09), maxLTV 50%, mint fee 0.50%, redeem fee 0.50%, redemption worst case 7 days, initial simulated wallet 250 stINJ, buffer 500 stINJ. The APR source and date live in the Sources drawer; the other values are tagged `[DECISION: illustrative]` with a one-line rationale. No value is hard-coded in a component.

### D7 — Custom SVG data graphics

`[DECISION]` The debt curve, headroom bar, Confluence buffer and loop diagram are hand-built SVG/CSS with `<title>`/`<desc>` and a table fallback. No chart library. Rationale: the curve is the product argument, not a generic chart; it needs annotations, a projection, a pressure gauge and a live state. A chart library would add bundle weight and a default visual language.

### D8 — Explicit risk state machine

`[DECISION]` Derive `rateStatus` from freshness and bounds; pause mints and harvest on stale/out-of-bounds/rate-drop; keep `redeem` and zero-debt `withdraw` enabled. A rate drop that pushes LTV above maxLTV sets `liquidationEligible`; the demo exposes a "trigger liquidation" simulation action and records bad debt. Every pause banner names the cause and the open exit.

### D9 — Test and evidence stack

`[DECISION]` Vitest for engine tests, Testing Library for UI state tests, Playwright (system Chrome channel) for screenshots and flows, axe for automated accessibility, Lighthouse for lab vitals, `tsc --noEmit` and ESLint for static gates. Screenshots at 375/768/1440 for every required state. If a tool cannot run, record the exact blocker as `[UNVERIFIED]`.

### D10 — No third-party runtime requests

`[DECISION]` Self-host fonts via `@fontsource`; no images, CDNs, analytics or remote APIs at runtime. The only network requests are the app's own static assets. This protects performance and privacy and keeps the artifact deployable as a static folder.

## Risks / Trade-offs

- **The simulation could be mistaken for a live protocol** → fixed "Simulated · contracts not deployed" badge on every view, sources drawer, no invented TVL/users/audits, all scenario values labelled.
- **The qINJ-burn model is a demo simplification** → disclosed in Borrow and Wellspring; the integration change must replace it with the protocol's actual repayment/redemption accounting.
- **A 7-day redemption queue is a fabricated parameter** → tagged `[DECISION: illustrative]`; the UI never implies instant INJ and never hides the worst case.
- **Custom CSS can drift into inconsistency** → one token source, a small component set, design QA against `DESIGN.md`, and a separate critique pass.
- **Large landing JS** → route-level code split, no animation library, self-hosted fonts, bundle budget gate. If the budget fails, cut the interactive curve before cutting accessibility.
- **Browser tooling missing** → if Playwright/Chrome/Lighthouse cannot run, mark visual and lab measurements `[UNVERIFIED]` and say exactly what is missing.
- **The protocol is paused** → no changes to `src/`, `test/` or `script/`; this change is frontend-only.

## Migration Plan

1. Build and validate the simulated app in `web/`.
2. When the protocol integration change starts, implement `TestnetClient` against the real `QuenchClient` interface and flip `VITE_QUENCH_MODE=testnet`.
3. Delete or stop importing `SimulatedClient` from production deployment; the build must contain no simulation code in testnet mode.
4. Re-point config sources and labels to the deployed contract addresses and verified rates.

## Open Questions

- Exact protocol ABI, deployed addresses and LST choice: owned by the paused protocol change; this UI invents none.
- Production Confluence buffer source and real redemption term: owned by the protocol change; the demo value is illustrative.
- Whether the integration change keeps the qINJ-burn repayment model or uses a different protocol mechanism: must be reconciled before the testnet client ships.

None of these block the simulated demo because the client seam isolates them.