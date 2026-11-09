# Proposal: build-quench-demo-ui

## Why

Quench has a protocol brief but no product surface. Investors, DeFi users and first-time borrowers cannot see the loop, the risk states or the exit paths, and an integration developer has no typed seam to build against. This change ships the real Quench frontend with only wallet, RPC and contracts simulated, so the product can be evaluated and handed off before the protocol build resumes.

## What Changes

- Add `web/`, a Vite + React + TypeScript single-page app with a story landing page and a full app shell.
- Implement the complete simulated loan lifecycle: connect, deposit LST, mint qINJ, Wellspring harvest/repayment, Confluence redemption in LST units, and zero-debt withdrawal.
- Add a typed domain-level `QuenchClient`; `SimulatedClient` now, `TestnetClient` stub, and `FaultyClient` for error-state tests. A `mode: simulated | testnet` flag chooses the client.
- Add all required states: empty, loading, pending, confirmed, failed, rejected, wrong network, stale/out-of-bounds rate, rate drop/liquidation eligibility, paused mints/harvest with exits open, redemption queue and zero-debt withdrawal.
- Add simulation controls (fast-forward, rate drop, stale/spike rate, wrong network, next transaction outcome, reset) that render only in simulated mode.
- Add the "Simulated · contracts not deployed" badge on every view and screenshot in simulated mode.
- Add the design system, story landing, docs and QA evidence: `docs/DESIGN.md`, `CASE-STUDY.md`, `DEMO-SCRIPT.md`, `DEPENDENCIES.md`, `QA.md`.

## Capabilities

### New Capabilities

- `demo-ui`: the Quench landing page, app shell, simulated lifecycle, client seam, state coverage, redemption disclosure, data graphics, accessibility, performance and content honesty.

### Modified Capabilities

None. This change amends the frontend scope for this change only; it does not change the protocol specs.

## Impact

- New `web/` app, tests, Playwright configuration, screenshots and build output.
- New frontend docs and updated `docs/research.md`, `docs/STATUS.md`, `AGENTS.md`.
- New dev dependencies for React, Vite, TypeScript, Vitest, Testing Library, Playwright, axe and Lighthouse; all pinned, licences recorded in `docs/DEPENDENCIES.md`.
- No Solidity, Foundry, `src/`, `test/` or `script/` changes. No wallet or chain library. No backend. No real keys or funds.
- The protocol change `build-quench-mvp` stays paused.