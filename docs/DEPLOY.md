# Quench MVP — deploy runbook (testnet 1439 only)

One Basin, one LST (`wstINJ`), one synthetic (`qINJ`). No mainnet, no real keys or funds.
Full docs: `docs/STATUS.md`, `docs/RISKS.md`, `docs/research.md`. Design: `openspec/changes/build-quench-mvp/design.md`.

> This is the **deploy runbook for the frozen reference build**. It is not the project's front
> door — see [`../README.md`](../README.md) for what Quench is and where it stands.
> `Basin`, `Wellspring` and `Confluence` are the internal contract names in this build; the user
> interface calls them the collateral vault, auto-repay and the swap buffer.

## Prerequisites (already present, no installs)

```bash
forge --version   # 1.3.5-stable (generic Foundry; tests use mock precompiles)
slither --version # 0.11.6
```

No new package is needed. Contracts use zero external libraries (own ERC-20 + Timelock).

## Verify

```bash
forge build
forge test
python3 script/simulate.py
slither src/
```

Expected: build ok, 38 tests pass, simulation prints the 6-row LTV/APR table, Slither 0 high/medium (triage in `docs/STATUS.md`).

## Deploy dry-run (no broadcast, no keys)

```bash
forge script script/Deploy.s.sol:DeployScript --rpc-url https://k8s.testnet.json-rpc.injective.network/
```

Expected output: `basin:`, `qinj:`, `adapter:`, `timelock:` addresses (simulation only; nothing is broadcast).
The script reverts on any `chainId != 1439` — verified against local anvil with `--chain-id 1439` (0x59f).
Against a generic anvil **without** a fork the script reverts with `call to non-contract address 0x0341…097` because the
live `wstINJ` bytecode only exists on testnet — use the live RPC for dry-run comparison.

## Known addresses (testnet, verified 2026-11-10)

- `wstINJ` collateral: `0x03416fa1F6c0DB7F31cC9Fe0F2c295Ed7159B097`
- `stINJ` underlying: `0xCc7DB620d09909D10d123f837b4284A600541930`
- Rate `convertToAssets(1e18)` ≈ 1.002369 (2026-11-10). WINJ (unused): `0x0000000088827d2d103ee2d9A6b781773AE03FfB`.

## End-to-end on testnet

**Blocked by hard rules:** `deposit → mint → yield accrues → harvest reduces debt → redeem → withdraw`
requires a testnet private key + faucet funds, which this repo never requests/stores/uses.
The identical lifecycle is proven locally in `test/unit/E2ETest.t.sol::testFullLoop` (mock rate) and by the
live dry-run above. To execute on testnet, fund a fresh testnet key from
`https://testnet.faucet.injective.network/` and run the same steps interactively — do not commit keys.

## Worst-case delay (read before redeeming)

Protocol redemption delay is **0 blocks** (same-block wstINJ units). An INJ cash exit depends on the LST's own
withdrawal path (NFT-based queue or instant pool, latency `[UNVERIFIED]` on testnet) — never on the 21-day unbonding.
