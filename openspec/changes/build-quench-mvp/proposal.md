# Proposal: build-quench-mvp

## Why

Injective EVM has yield-bearing INJ liquid-staking tokens (LSTs), but no native self-repaying loan primitive. A borrower must either sell collateral or service debt manually, so staking yield does not automatically reduce leverage. Quench closes that gap with a testnet-only, clean-room MVP: LST collateral stays in a Basin, qINJ is minted against it, and Wellspring applies contract-measured LST yield to the debt.

## What Changes

- Introduce one Basin vault that accepts one yield-bearing INJ LST, values collateral in INJ using the LST contract's exchange rate, and enforces `collateralValue × maxLTV ≥ debt`.
- Introduce qINJ, an INJ-denominated synthetic ERC-20 minted against Basin collateral and burned on repayment.
- Introduce Wellspring, a permissionless harvest path that measures LST exchange-rate deltas and applies them to debt; no side-channel reward claims.
- Introduce Confluence, which redeems qINJ for LST units without waiting on Injective's 21-day unbonding, and states the worst-case delay.
- Add protocol safety controls: a rate source fixed per Basin at deploy, stale/out-of-bounds rate pauses for mints and harvest, exits that stay open, a defined slashing/rate-drop path, timelocked admin, and reentrancy guards.
- Add a QNCH governance-token interface stub only; no governance behavior in this MVP.
- Deliver Foundry tests and invariants, a repayment-time simulation, Slither triage, and a testnet-1439 deployment runbook.

## Scope

Testnet-only MVP with one Basin, one LST and one synthetic. All code, specs and evidence live in this repository. Deployment is limited to chain 1439.

## Out of Scope

Frontend, mainnet deployment, real keys or funds, leverage loops, multi-collateral support, production audit certification, QNCH governance mechanics, and any copied Alchemix code.

## Capabilities

### New Capabilities

- `basin`: collateral custody, per-account collateral/debt accounting, LTV enforcement, deposit and withdraw behavior.
- `qinj`: INJ-denominated synthetic token mint, burn, transfer and supply accounting.
- `wellspring`: exchange-rate yield measurement, harvest authorization, and automatic debt repayment.
- `confluence`: qINJ redemption for LST units, redemption accounting, and worst-case delay disclosure.
- `protocol-safety`: fixed rate source, staleness/bounds pause rules, slashing/rate-drop handling, timelocked administration and exit guarantees.

### Modified Capabilities

None. This is a new protocol with no existing specs.

## Impact

- New Solidity sources under `src/`, tests under `test/`, deployment and simulation scripts under `script/`.
- New OpenSpec delta specs, design and task evidence under `openspec/changes/build-quench-mvp/`.
- New project docs: brief, claims register, risks, status and deploy runbook.
- External dependencies: one audited INJ LST contract, Injective EVM precompiles if the LST path requires them, and InjectiveLabs' patched Foundry or precompile mocks. No mainnet, no real funds.
