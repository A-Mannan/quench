# Tasks: build-quench-demo-ui

## 1. Research

- [ ] 1.1 Inventory installed skills, MCP/tools and browser tooling; read each used skill's `SKILL.md` before use. Evidence: `docs/QA.md` inventory table and `docs/DEPENDENCIES.md` entries.
- [ ] 1.2 Fetch Awwwards criteria and at least five recent Sites of the Day; record structure, type, motion and density observations. Evidence: `docs/research.md` U1–U10 with URLs and dates.
- [ ] 1.3 Fetch at least three shipped DeFi apps (Aave, Hyperliquid, DeepBook) and record first-screen composition without copying. Evidence: `docs/research.md` U8–U10.
- [ ] 1.4 Read Alchemix public docs for the mental model only and confirm the BRIEF divergence on yield-to-debt. Evidence: `docs/research.md` U11–U13.
- [ ] 1.5 Fetch Injective EVM network/precompile facts used by the UI. Evidence: `docs/research.md` U15–U16 with URLs.
- [ ] 1.6 Fetch current INJ staking APR with source and date; make it the visible sim default. Evidence: `docs/research.md` U14; Sources drawer screenshot/text.
- [ ] 1.7 Vet every dependency for maintainer, licence, maintenance and release age ≥14 days; pin versions and record why. Evidence: `docs/DEPENDENCIES.md` with versions, licences and dates; lockfile committed.
- [ ] 1.8 Install the updated Taste Skill and inspect the OpenDesign craft layer; record what is used and what is not. Evidence: `docs/DEPENDENCIES.md` and `docs/DESIGN.md` §9.

## 2. Design

- [ ] 2.1 Write `docs/DESIGN.md` with concept, tokens, type, layout, motion, contrast ratios and rejected alternatives. Evidence: file plus contrast table.
- [ ] 2.2 Write the OpenSpec `proposal.md`, `design.md`, `specs/demo-ui/spec.md` and this task list; run `openspec validate build-quench-demo-ui`. Evidence: validation output in `docs/QA.md`.
- [ ] 2.3 Define the `QuenchClient` interface, the simulation state machine and the illustrative parameter set in `README`/design docs. Evidence: interface file and `docs/DESIGN.md` D4–D8.
- [ ] 2.4 Write the page plan and the first-viewport loop statement (≤20 words). Evidence: `docs/DESIGN.md` and landing screenshot.

## 3. Build

- [ ] 3.1 Scaffold `web/` with pinned Vite/React/TypeScript, strict tsconfig, ESLint and Vitest. Evidence: `pnpm install`, `pnpm typecheck`, `pnpm lint` exit 0.
- [ ] 3.2 Build the fixed-point engine and config; implement deposit, mint, harvest, redeem, withdraw, rate growth, stale/out-of-bounds, rate drop and liquidation path. Evidence: `engine.test.ts` passing with counts.
- [ ] 3.3 Implement the typed client seam: `QuenchClient`, `SimulatedClient`, `TestnetClient`, `FaultyClient`, `createQuenchClient` and localStorage persistence. Evidence: interface test and `SimulatedClient`/`FaultyClient` UI tests.
- [ ] 3.4 Build the global styles/tokens and shared components: shell, buttons, fields, banners, dialogs, drawers, toasts, charts, badges, sources. Evidence: design screenshots and keyboard test.
- [ ] 3.5 Build the story landing page: hero with falling debt, loop diagram, interactive repayment curve, exits/risk sections, CTA, footer. Evidence: screenshots at 375/768/1440.
- [ ] 3.6 Build the app: connect, overview, Basin, Borrow, Wellspring, Confluence, Activity and Sources. Evidence: Playwright flow test and screenshots.
- [ ] 3.7 Build all required states and simulation controls: empty, loading, pending, confirmed, failed, rejected, wrong network, stale, out-of-bounds, rate drop, liquidation eligible, redemption queue, zero-debt withdraw. Evidence: state-test table in `docs/QA.md`.
- [ ] 3.8 Write `README.md` with install/run/build commands and the `VITE_QUENCH_MODE` flag. Evidence: commands run from a clean state.
- [ ] 3.9 Write `docs/DEMO-SCRIPT.md` (≤90 s) and `docs/CASE-STUDY.md` (≤1 page, 5 decisions, 3 details tied to screenshots). Evidence: files and screenshot links.

## 4. Verify

- [ ] 4.1 Run `pnpm typecheck`, `pnpm lint`, `pnpm test` and `pnpm build`; paste counts and exit codes. Evidence: `docs/QA.md`.
- [ ] 4.2 Run the Playwright E2E loop and all state screenshots at 375/768/1440. Evidence: screenshot paths and test output.
- [ ] 4.3 Run axe and Lighthouse per route; record LCP/INP/CLS method and results; measure landing JS gzip. Evidence: `docs/QA.md` table.
- [ ] 4.4 Verify the testnet-mode build contains no simulation engine and the simulated badge/controls are absent. Evidence: grep/build output.
- [ ] 4.5 Run the independent critique pass (fresh-context subagent) against the installed design skills, `docs/DESIGN.md` and the Awwwards rubric; log failing elements. Evidence: critique report and `docs/QA.md` iteration line.
- [ ] 4.6 Verify contrast pairs, keyboard operation, focus visibility and reduced motion. Evidence: axe output and manual checklist.
- [ ] 4.7 Verify every cited URL in `docs/research.md`, `docs/DESIGN.md` and UI copy was fetched, with date/status. Evidence: link audit table.

## 5. Final pass

- [ ] 5.1 Round 1: re-run all gates; attack as an investor with 10 ways the UI could mislead or be misread; fix and log one QA line. Evidence: `docs/QA.md` round-1 line.
- [ ] 5.2 Round 2: repeat as an Awwwards juror (generic, slow, unusable on phone); fix and log one QA line. Evidence: `docs/QA.md` round-2 line.
- [ ] 5.3 Round 3: repeat until a round finds nothing new; if not converged, stop and log open issues. Evidence: `docs/QA.md` round-3 line.
- [ ] 5.4 Final consistency pass across BRIEF amendment, DESIGN, research, QA, STATUS, AGENTS, README and OpenSpec artifacts. Evidence: checklist in `docs/QA.md`.
- [ ] 5.5 Write the final reply (≤250 words): what shipped, how to run, pasted outputs, score table, `[UNVERIFIED]` list and open questions. Evidence: final message.