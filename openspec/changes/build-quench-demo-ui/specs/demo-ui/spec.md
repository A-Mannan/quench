# Spec Delta: demo-ui

## Purpose

Defines the Quench demo frontend: a story landing page and an app that exercises the full self-repaying loan loop against a typed domain client, with simulated integrations and honest risk states.

## ADDED Requirements

### Requirement: Simulated mode is disclosed on every view

The app SHALL render "Simulated · contracts not deployed" on every view and in every screenshot while the active mode is simulated. Simulation controls SHALL render only in simulated mode. The testnet-mode build SHALL contain no simulation engine code. `[DECISION]`

#### Scenario: Simulated view carries the badge

- **WHEN** the user opens the landing page or any app route in simulated mode
- **THEN** the badge "Simulated · contracts not deployed" is visible without interaction
- **AND** the fast-forward, rate-drop, stale-rate, wrong-network, next-transaction and reset controls are available only from the simulation surface

#### Scenario: Testnet build excludes simulation

- **WHEN** the app is built with `VITE_QUENCH_MODE=testnet`
- **THEN** the output contains no `SimulatedClient` or simulation-engine module
- **AND** the simulated badge and simulation controls are absent

### Requirement: A user can open a position

The app SHALL let a connected user deposit one LST into the Basin and mint qINJ up to `collateralValue × maxLTV`, with the mint fee and resulting debt shown before confirmation. `[DECISION]`

#### Scenario: Deposit and mint

- **WHEN** a connected user deposits a valid LST amount and mints a valid qINJ amount
- **THEN** the Basin collateral and qINJ debt update in the same transaction flow
- **AND** the receipt shows the amount received, the fee, the new debt and the remaining headroom

#### Scenario: Mint above the LTV bound is blocked

- **WHEN** the requested mint would make debt greater than `collateralValue × maxLTV`
- **THEN** the primary action is disabled with a plain-language reason
- **AND** no transaction is submitted

### Requirement: Wellspring repays debt from exchange-rate yield

Wellspring SHALL derive harvestable yield only from the LST exchange-rate delta, burn qINJ from the connected wallet against the debt, and reduce debt by exactly the value burned. No side-channel reward claim SHALL be used. `[DECISION]`

#### Scenario: Harvest reduces debt

- **WHEN** the exchange rate has increased since the last harvest and the wallet holds enough qINJ
- **THEN** harvest burns the qINJ amount equal to the yield value, capped by debt
- **AND** debt falls by that amount and the event is recorded

#### Scenario: Wallet balance limits repayment

- **WHEN** the wallet holds less qINJ than the yield value
- **THEN** harvest burns only the available qINJ
- **AND** the UI states that automatic repayment is limited by the wallet balance

### Requirement: Exits never wait on unbonding

Confluence SHALL redeem qINJ in LST units, never in INJ, and SHALL state the worst-case delay. If the simulated buffer is insufficient, the redemption SHALL be queued with a visible position and delay; it SHALL NOT block redemption indefinitely. Zero-debt withdrawal SHALL remain available while mints and harvest are paused. `[DECISION]`

#### Scenario: Redemption pays LST

- **WHEN** a user redeems qINJ while the buffer has enough LST
- **THEN** the receipt shows the LST amount, the fee, the buffer after, and the worst-case delay
- **AND** the copy never implies instant INJ

#### Scenario: Empty buffer queues without freezing

- **WHEN** the requested redemption exceeds the buffer
- **THEN** the redemption is recorded as queued with its LST amount and worst-case delay
- **AND** the user can still see the queue and no protocol pause disables the redemption action

#### Scenario: Zero-debt withdrawal while paused

- **WHEN** debt is zero and the rate is stale, out of bounds or in a rate-drop state
- **THEN** the withdraw action remains enabled
- **AND** the user can remove collateral

### Requirement: All transaction and data states are rendered

Every data surface SHALL render loading, empty, populated, error and edge states. Every transaction SHALL render pending, confirmed, failed and rejected states. A wrong-network view SHALL block actions with a recovery action. `[DECISION]`

#### Scenario: Failed and rejected transactions

- **WHEN** a simulated transaction fails or the user rejects it
- **THEN** the UI preserves the entered amount, names the cause and offers a retry
- **AND** no success state is shown

#### Scenario: Empty position

- **WHEN** the connected wallet has no Basin position
- **THEN** the overview shows an empty-state explanation and a deposit action
- **AND** the debt curve is replaced by an invitation, not a fake zero-value chart

### Requirement: Risk states pause only the risky paths

A stale rate, an out-of-bounds rate or an LST rate drop SHALL pause mints and harvest and SHALL show the cause, the current raw rate and the consequence. A rate drop that pushes LTV above maxLTV SHALL mark the position liquidation-eligible and expose the simulated liquidation path. Exits SHALL remain enabled. `[DECISION]`

#### Scenario: Stale rate

- **WHEN** the rate timestamp is older than the configured freshness window
- **THEN** mints and harvest are disabled with a "rate stale" explanation
- **AND** redeem and zero-debt withdraw remain enabled

#### Scenario: Rate drop below solvency

- **WHEN** the exchange rate drops such that debt exceeds `collateralValue × maxLTV`
- **THEN** the position is flagged liquidation-eligible
- **AND** the UI shows the shortfall and the simulated liquidation action

### Requirement: The UI depends on one typed client seam

The UI SHALL import only a domain-level `QuenchClient` interface, SHALL use bigint fixed-point amounts, and SHALL select `SimulatedClient` or `TestnetClient` from a `mode: simulated | testnet` flag. A `FaultyClient` SHALL drive deterministic error-state tests. No ABI or contract address SHALL be invented. `[DECISION]`

#### Scenario: Same UI against both clients

- **WHEN** the app is rendered with `SimulatedClient` and with `FaultyClient`
- **THEN** both satisfy the same interface and the UI renders without importing either concrete class
- **AND** the faulty client produces the error states without changing UI components

#### Scenario: Testnet client is a stub

- **WHEN** `VITE_QUENCH_MODE=testnet` and the user connects
- **THEN** the testnet client reports that contracts are not wired in this change
- **AND** no fabricated address or ABI is used

### Requirement: Parameters and sources live in one place

Financial parameters SHALL live in one config module, and a Sources drawer SHALL show each parameter's source and date or the tag `[DECISION: illustrative]`. Components SHALL contain no financial literals. The INJ staking APR SHALL show its source and fetch date. `[DECISION]`

#### Scenario: Sources drawer

- **WHEN** the user opens Sources from any view
- **THEN** the drawer lists APR, maxLTV, mint fee, redeem fee, redemption delay and the simulation buffer with source/date or illustrative tag

### Requirement: Data is the hero

The landing first viewport SHALL state the loop in 20 words or fewer and SHOW debt falling. The debt-repayment curve and headroom view SHALL be purpose-built graphics with raw values and consequences, not bare status badges or charts dropped into cards. `[DECISION]`

#### Scenario: First viewport

- **WHEN** the landing page loads at 375, 768 or 1440 px
- **THEN** the loop statement is at most 20 words
- **AND** a debt line is visibly falling within the first viewport

### Requirement: Accessibility and performance are measured

The app SHALL meet WCAG 2.2 AA, be keyboard-operable, honour reduced motion, and be checked at 375/768/1440 px. Per route, a production build SHALL target LCP ≤2.5 s, INP ≤200 ms and CLS ≤0.1 using the web.dev definitions, with the measurement method stated. TypeScript strict and lint SHALL pass; routes SHALL be code-split; landing JS SHALL be ≤300 KB gzip. `[DECISION]` (thresholds: https://web.dev/articles/vitals; WCAG: https://www.w3.org/TR/WCAG22/)

#### Scenario: Keyboard and reduced motion

- **WHEN** the user navigates with the keyboard and has `prefers-reduced-motion: reduce`
- **THEN** all controls are reachable and focus is visible
- **AND** the hero draw, count-ups, pulse and drawer translation are removed without losing state changes

### Requirement: Content is honest about the simulation

The UI SHALL NOT invent TVL, users, audits, partners, testimonials or third-party logos. Yield SHALL appear only as a scenario with the APR assumption visible. The interface SHALL claim no award eligibility and SHALL label the self-score as a self-score. `[DECISION]`

#### Scenario: Risk metric with no bare "Safe"

- **WHEN** the UI shows LTV, headroom, buffer or rate
- **THEN** it shows the raw value and the consequence
- **AND** it does not show a standalone "Safe ✓" badge

#### Scenario: Self-score is labelled

- **WHEN** `docs/QA.md` reports the Awwwards rubric score
- **THEN** it states that this is a self-score, not a jury score
- **AND** it claims no award eligibility

### Requirement: The demo is reproducible and scripted

`docs/DEMO-SCRIPT.md` SHALL walk the full loop in 90 seconds or less. `docs/QA.md` SHALL contain screenshot paths, pasted command output and a per-route score table. A fresh checkout SHALL build and run with documented commands. `[DECISION]`

#### Scenario: Demo script runs

- **WHEN** a presenter follows `docs/DEMO-SCRIPT.md` from a clean simulated state
- **THEN** the loop reaches zero debt and a completed withdrawal within 90 seconds

#### Scenario: Clean build

- **WHEN** a developer runs the documented install, typecheck, lint, test and build commands from `web/`
- **THEN** each command exits successfully and the output is reproducible