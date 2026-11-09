# Design: build-quench-mvp

## Context

Quench targets Injective EVM testnet (chain 1439) with one yield-bearing INJ LST, one Basin and one INJ-denominated synthetic (qINJ). The motivating problem and scope are in `proposal.md`; the verbatim brief is `docs/BRIEF.md`.

Constraints that shape the design:

- Injective EVM precompiles are not visible to generic Foundry; the staking precompile ABI is unverified. See `docs/research.md` claim C5.
- INJ unbonding takes 21 days, so redemption cannot rely on protocol-initiated unbonding.
- Alchemix V3 is BUSL 1.1 and this project is clean-room; no Alchemix code may be read into or copied into this repository.
- The MVP is testnet-only, unaudited, and must never touch real keys or funds.

## Goals / Non-Goals

**Goals:**

- One working loan lifecycle: deposit LST, mint qINJ, harvest LST yield into debt repayment, redeem qINJ for LST units, withdraw collateral at zero debt.
- Accounting that is conservative under rounding, donations, rate drops and reentrancy.
- Every external fact and design choice carries a source or a `[DECISION]` tag.
- A deployable testnet-1439 artifact with a runbook and reproducible evidence.

**Non-Goals:**

- Mainnet readiness, a frontend, leverage loops, multi-collateral, real funds, QNCH governance behavior, or a production audit.
- Reimplementing Alchemix mechanics or copying its code, parameters or report snippets.
- Protocol-managed validators or native delegation unless the LST path is proven to fail.

## Decisions

Each entry is seeded from the user brief's DECISIONS (2026-11-08). Evidence is attached during research; a decision changes only with cited evidence.

### D1 — Solidity + Foundry on Injective EVM, not CosmWasm

**Status:** `[DECISION]` — seeded by user brief.

Use Solidity contracts and Foundry for build, fuzz and invariant tests. Rationale: the target is Injective EVM, precompile demos and LST contracts are Solidity, and Foundry gives the required fuzz/invariant evidence. Alternatives: CosmWasm (wrong VM and incompatible with EVM LSTs); Hardhat (weaker invariant tooling for this scope).

### D2 — Collateral is an existing LST; native delegation via 0x66 only with cited evidence the LST path fails

**Status:** `[DECISION]` — seeded by user brief.

Quench should be a lending protocol, not a staking manager. Using an existing LST avoids validator operations and the 21-day unbonding path. Native delegation through the staking precompile is a fallback only if research proves the LST path cannot work; that evidence must be recorded in `docs/research.md` first.

### D3 — INJ-denominated accounting; contract exchange rate only; harvest only from rate deltas

**Status:** `[DECISION]` — seeded by user brief.

Collateral and debt are denominated in INJ. Solvency uses the LST→INJ exchange rate read from the LST contract, never DEX spot. Wellspring derives yield only from exchange-rate deltas, never from side-channel reward claims. Rationale: a single manipulation-resistant rate source and no reward-claim accounting surface. Alternatives rejected: DEX spot/TWAP (manipulable, liquidity-dependent); external reward claims (extra trust and accounting paths).

### D4 — Redemption pays LST units and does not wait on unbonding

**Status:** `[DECISION]` — seeded by user brief.

Confluence pays qINJ redeemers in LST units, following the principle that Alchemix V3's Transmuter pays yield tokens rather than underlying. Redemption must not block on the 21-day unbonding queue. Every redemption description must state the worst-case delay and any dependency on secondary-market liquidity. Alternative rejected: protocol-initiated unbonding (21-day delay and validator risk).

### D5 — Slashing and rate-drop path is defined and tested

**Status:** `[DECISION]` — seeded by user brief; policy details open.

A drop in the LST exchange rate must follow an explicit, tested path: liquidation or loss socialisation. The choice and parameters are resolved during research/spec work and proven by fuzz/invariant tests. Pause-only handling that leaves untested bad debt is not acceptable.

### D6 — Rate source fixed per Basin at deploy; stale/out-of-bounds pauses mints and harvest; exits stay open

**Status:** `[DECISION]` — seeded by user brief.

The rate source is fixed when the Basin is deployed. A stale rate or an out-of-bounds delta pauses harvest and mints. If the LST is upgraded or deprecated, mints pause and exits remain open. Pausing must never block honest withdrawals or redemptions. Alternative rejected: governance-swappable rate source in the MVP (adds an admin attack surface).

### D7 — Timelocked admin, no unbacked mint, no unbounded user loops, reentrancy guards

**Status:** `[DECISION]` — seeded by user brief.

Admin actions are timelocked. No admin path may mint unbacked qINJ. No function iterates over an unbounded user set. Every value path has a reentrancy guard. Alternatives rejected: instant admin (too much power); owner mint (breaks solvency); per-user loops (gas denial-of-service).

### D8 — maxLTV, fees and redemption term come from simulation

**Status:** `[DECISION]` — seeded by user brief; values open.

Set maxLTV, fees and redemption term by simulating debt-repayment time against a sourced and dated INJ staking APR across at least three LTV/APR scenarios. Do not copy Alchemix parameters. Values are recorded with the simulation output before implementation.

### D9 — QNCH is an interface stub only

**Status:** `[DECISION]` — seeded by user brief fixed names.

Ship a QNCH interface stub to reserve the name and surface. No governance mechanics, minting, voting or admin powers are implemented in this MVP.

### D10 — Testnet only; no real keys or funds

**Status:** `[DECISION]` — seeded by user brief hard rules.

All deployment and end-to-end work targets chain 1439. No mainnet deployment, no real keys, no funds. Any request to cross that boundary stops for explicit user approval.

## Risks / Trade-offs

- **LST yield may not be contract-measurable or the rate may be manipulable** → research matrix and on-chain verification gate; rate bounds and pause; `[UNVERIFIED]` until proven.
- **Redemption in LST units may still need secondary liquidity for an INJ exit** → state worst-case delay and liquidity dependency wherever redemption is described; never freeze redemption.
- **Slashing/socialisation can create bad debt** → explicit tested path, conservative LTV, invariant that protocol transitions preserve solvency.
- **Precompile ABI uncertainty** → mock precompiles in unit/fuzz tests and use InjectiveLabs' patched Foundry for fork/testnet; state which path each test uses.
- **BUSL 1.1 licensing** → clean-room process, no Alchemix code or report snippets; unresolved legal risk flagged to the user.
- **Unaudited testnet MVP** → no real funds, no mainnet, documented limitations.
- **Admin/timelock centralization** → timelock, no unbacked mint, exits never blocked.
- **Donation/inflation and rounding** → invariant tests for donation/inflation and rounding never favouring the user.

## Open Questions

These are research questions, not skipped design decisions. Each must be resolved with cited evidence before its dependent spec or code is written.

1. **Which LST?** Hydro hINJ/yINJ versus Accumulated stINJ/wstINJ. Resolve with the decision matrix in task 1.5 and explorer/on-chain verification in task 1.6.
2. **Does the LST path work on Injective EVM?** If not, is native delegation via 0x66 justified by cited evidence? Resolve in tasks 1.3 and 1.6.
3. **What is the liquid redemption route and worst-case delay?** Resolve in tasks 1.5, 1.6 and the Confluence spec.
4. **Slashing policy:** liquidation versus loss socialisation, and its parameters. Resolve before the protocol-safety spec.
5. **maxLTV, fees and redemption term:** resolve from the task 4.5 simulation, not from Alchemix defaults.
6. **Is InjectiveLabs' patched Foundry available locally?** If not, which tests use mocks? Resolve in task 1.11.
7. **Name collisions** for Quench, qINJ and QNCH: report search results, do not certify availability. Task 1.9.
8. **Licence position:** read each Alchemix repo's LICENSE and report; legal risk remains unresolved. Task 1.10.
9. **Testnet addresses and faucet:** chosen LST address, WINJ, faucet and RPC behavior. Tasks 1.2 and 1.6.
10. **QNCH stub placement:** interface-only file versus no source artifact. Resolve during spec/design review at G1.
