# AGENTS.md — Quench

## Purpose

Quench is a clean-room, testnet-only, self-repaying loan protocol on Injective EVM. Users deposit a yield-bearing INJ LST into one Basin, mint qINJ (INJ-denominated synthetic) up to `collateralValue × maxLTV`, and Wellspring applies LST yield to the debt. Confluence redeems qINJ for collateral value; at zero debt the user withdraws remaining collateral.

This repository is the single source of truth. Resume from files, not chat history.

## Fixed names

- **Quench** — protocol.
- **qINJ** — INJ-denominated synthetic.
- **Basin** — vault.
- **Wellspring** — harvest and repayment.
- **Confluence** — redemption.
- **QNCH** — governance token, interface stub only.

## Stack

- Solidity + Foundry on Injective EVM (testnet chain 1439; mainnet 1776 is out of scope).
- One Basin, one LST, one synthetic. No CosmWasm.
- InjectiveLabs' patched Foundry for fork/testnet work, or mocked precompiles in unit/fuzz tests; state which.

## Hard rules

- **Testnet only.** No mainnet deployment or mainnet transactions.
- **No real keys or funds.** Never request, store or use them.
- **Clean-room.** Copy no Alchemix code, including snippets quoted in audit reports. Read each repo's LICENSE before its code.
- **Evidence.** Every factual claim cites a fetched URL or explorer/RPC output. Unconfirmed claims are tagged `[UNVERIFIED]`. Every design choice cites a source or is tagged `[DECISION]`. Every ticked task names its evidence.
- **No unapproved installs.** Do not install or run external tools without user approval; name what is missing and proceed without it. Exception: `build-quench-demo-ui` pre-approved installs for `web/` (see `docs/DEPENDENCIES.md`) — that approval is scoped to this change.
- **No invented facts.** If live docs contradict a FACT and the design changes, stop and ask.
- **Safety.** Timelocked admin; no admin path to mint unbacked qINJ; no unbounded loops over users; reentrancy guards on all value paths; pausing never blocks honest exits.
- **Redemption.** Never wait on 21-day unbonding. Pay in LST units or justify another verified liquid route; state worst-case delay.
- **Stop before** mainnet, touching keys or funds, unapproved installs, or crossing the G1 gate.

## Reading order

1. `docs/STATUS.md` — current phase, last action, next step, blockers.
2. `openspec/changes/build-quench-mvp/tasks.md` — what to do next; tick as you go.
3. `openspec/changes/build-quench-mvp/design.md` — decisions D1–D10 and open questions.
4. `docs/research.md` — claims register and evidence status.
5. `docs/BRIEF.md` — verbatim project brief, facts, success criteria.

Also read `openspec/changes/build-quench-mvp/proposal.md` for scope and `openspec/config.yaml` for context and rules.

## Commands

- Telemetry: prefix OpenSpec commands with `OPENSPEC_TELEMETRY=0` (user instruction).
- OpenSpec version: `openspec --version` → 1.15.0.
- Validate change: `openspec validate build-quench-mvp` (currently fails only because delta specs are intentionally not written yet).
- Change status: `openspec status --change build-quench-mvp --json`.
- Instructions: `openspec instructions <artifact> --change build-quench-mvp --json`.
- Foundry build/test: **TBD** — not set up; blocked by the G1 gate.
- Slither: **TBD** — confirm availability during task 1.1.
- Testnet RPC: `https://k8s.testnet.json-rpc.injective.network/` (unverified until task 1.4).

## Working rule

**Tick `tasks.md` and update `docs/STATUS.md` as you work.** Every ticked task must name its evidence. At the end of every session, rewrite STATUS with the current phase, last action, next step, blockers and open questions. Do not tick a task without evidence.

## Amendments (run from files, not chat)

- **`build-quench-demo-ui` GO (2026-11-09)** amends BRIEF's "Out of scope: frontend" **for that change only**. The demo UI lives in `web/`; `build-quench-mvp` stays paused and must not create `src/`, `test/` or `script/` until a separate GO + G1 review. `docs/BRIEF.md` is unedited; this line is the amendment record. The installs exception above belongs to the same change.
- **UI v9 (2026-11-09):** user asked for a fuller-blue, Hermes-flavoured app (own colours), a better dark theme, and a non-magnifier logo. v9 keeps the dealt `cool-grey-cobalt` + `instrument` pairing but makes blue the structure: drop mark + lowercase `quench` logotype (exact-geometry favicon), grouped rail with solid cobalt active tab, Day/Night segmented control everywhere, blue-tinted day paper (`#EDF0F6`) and night lab (`#090B0F`/`#151A24`, blue rules, inset highlights), neutral disabled states, banner/toast layout fixes. E2E hardened for dual-breakpoint nav (`:visible` locators); gates: 33/33 Playwright, 12/12 Vitest, tsc/lint 0, axe 0. See `docs/DESIGN.md` v9/v11, `docs/QA.md` v9/v11, `web/screenshots/v9/`–`web/screenshots/v11/`.
- **UI v2 → v4 (2026-11-09):** user rejected V1 ("below average") and then V2/V3 ("revamping does not only mean changing font and theme colors"). V4 is a composition rebuild on the dealt system (`start.mjs deal --page software --trade fintech` → `warm-black-gold` + `schibsted`, `nav-cards`/`footer-statement`/`close-word`/`space`/`tonal`/`dots`, moment `letters-assemble`): 100svh hero with full-bleed curve, loop as connected sequence, type-moment exits, assembling statement, risk ledger, unified close+footer. See `docs/DESIGN.md` v4, `docs/QA.md` v4 addendum, `web/screenshots/v4-*`. Fonts swapped Anybody/Public Sans/IBM Plex Mono → Schibsted + JetBrains Mono (self-hosted). The `QuenchClient` seam and engine are unchanged. `chrome-devtools-mcp@1.12.0` is wired into the workspace MCP config (no telemetry/CrUX); it activates after an OpenCode restart and is an agent-debugging lane, not the test suite.

## Phase gate

Phase 0 is complete. On `GO`, start at the first unticked task. Stop at **G1 — user reviews specs and design before any `src/`**. Do not create `src/` before G1 is approved and recorded in `docs/STATUS.md`.
