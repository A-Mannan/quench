# STATUS

**Current phase:** `build-quench-mvp` implemented 2026-11-10 after the user's explicit "MVP all the way" selection (counts as G1 approval + GO to create `src/`). All groups 1–5 complete except blocked on-chain E2E (4.6). `build-quench-demo-ui` v31 (compact widgets) + promo film shipped 2026-11-10 (untouched by the MVP work).

**Last action (2026-11-10):** UI v31 — widget compaction. Loans and Withdraw after-values collapsed from a stacked panel to a 3-column `after-strip` (live dot + fee, Collateral/Debt/LTV with deltas, headroom + LTV bar); Positions dropped the redundant sentence, moved Harvest inline with the status pill, put Repay inline with its input (stacking only ≤480px), and paired Swap + Self-liquidate in one footer row — card height ~1000px → ~520px at 1440. Swap got its polish pass: one heading (the empty state is no longer a second `h2`), the output box takes the accent only when there is an input, fee shows `0.50%` at rest, buffer-aware copy (`Buffer covers this redemption` vs the queue banner), `Balance` wording matched to Positions, input labelled. Removed the decorative `/ 01` sheet numbers from every instrument bar (`Loans`, `Positions`, `Swap / redemptions`, `Positions / withdraw`) and the landing hero mock (`Basin`), plus the external-link `↗` from transaction buttons (`Add collateral & borrow`, `Redeem qINJ`, `Withdraw stINJ`) — actions read as actions; landing links keep their arrows. Film re-rendered from fresh 2× captures of this UI. Gates: `typecheck 0 · lint 0 · build OK · Vitest 19/19 · Playwright 33/33 · axe 0 · HyperFrames check 0 errors · timeline 0 errors · qa.py PASS`; `promo/renders/quench-16x9-final.mp4` 1920×1080 30fps 40.00s, −15.88 LUFS, TP −1.35.

**Previous (2026-11-10):** Built the Quench MVP Foundry project (zero external deps, own ERC-20/Timelock, mock precompiles): `src/Basin.sol` (deposit/withdraw, mint with LTV+fee from collateral, harvest from rate deltas, borrower-only redeem in wstINJ units, partial/full liquidation, staleness+bounds pause with exits open, timelocked admin), `src/QINJ.sol`, `src/RateAdapter.sol` (`convertToAssets(1e18)`), `src/Timelock.sol`, `src/QNCH.sol` stub. Chosen LST: Accumulated `wstINJ` `0x03416fa1F6c0DB7F31cC9Fe0F2c295Ed7159B097` (rate ≈1.002369, 2026-11-10); Hydro `[UNVERIFIED]` on testnet. Gates:
```
forge build → successful (warnings only, naming/style)
forge test → Ran 8 test suites: 38 tests passed, 0 failed, 0 skipped
python3 script/simulate.py → 6 rows; 7.53% (2026-11-10, C16) at 50% LTV = 6.64 yr
slither 0.11.6 → 29 results, 0 high/medium (triage in docs/research.md)
forge script Deploy.s.sol --rpc-url testnet-RPC → dry-run OK (basin/qinj/adapter/timelock); no broadcast
openspec validate build-quench-mvp --strict → Change 'build-quench-mvp' is valid
```
Full-loop E2E (`testFullLoop`) proves deposit→mint→harvest→redeem→withdraw locally. Live testnet E2E is **blocked by hard rules** (no keys/faucet funds) — see `README.md`.

**Earlier (2026-11-10):** UI v30 + film re-render. Loans gets a premium after-panel (live dot, Collateral/Debt deltas, LTV bar + headroom, fee footnote) and concise CTA (`Add collateral & borrow` / `Add X stINJ` / `Borrow X qINJ`); Positions rebuilt as a centered 440 px `Position` instrument — single heading, status pill, Pending repayment, Collateral/Debt/wallet/APY readouts, LTV bar, Harvest → Repay → Swap → Self-liquidate hierarchy, History/filter/count-badge removed (single position is implicit). Naming unified to Loans/Positions/Swap across the app chrome (`Positions / withdraw`, `Swap buffer`, `Amount to swap`); protocol nouns Basin/Wellspring/Confluence stay only where BRIEF fixes them (landing). Blockers fixed: duplicate `selfLiquidate` implementations removed (tsc/lint green), partial-withdraw engine test updated for mint-fee collateral and drop-paused withdraw. Film re-rendered from fresh 2x captures of the new UI (`promo/capture.mjs` drives the unified Loans flow); numbers unchanged, cuts PASS at 8 s via a 1.28x push-in, loudness -15.88 LUFS. Gates: `typecheck 0 · lint 0 · build OK · Vitest 19/19 · Playwright 33/33 · axe 0 · HyperFrames check 0 errors · timeline 0 errors · qa.py exit 0`.

**Next step:** User reviews UI v31 and the re-rendered film, then commit the demo-UI + promo work (`web/`, `promo/`, `docs/promo/`, `docs/QA.md`, `docs/DESIGN.md`, `docs/STATUS.md`) — still uncommitted on `main`. Commit the MVP separately (`src/`, `test/`, `script/`, `foundry.toml`, `docs/research.md`, `docs/RISKS.md`, `README.md`, `openspec/changes/build-quench-mvp/`). To run the on-chain E2E, fund a fresh testnet key from `https://testnet.faucet.injective.network/` and interact manually — do not commit keys.

## Validation / status results (as-is)

- `openspec validate build-quench-mvp --strict` → exit 0: `Change 'build-quench-mvp' is valid`.
- `openspec validate build-quench-promo-video --strict` → exit 0: `Change 'build-quench-promo-video' is valid`.
- `openspec validate build-quench-demo-ui --strict` → exit 0: `Change 'build-quench-demo-ui' is valid`.
- MVP: `forge build` ok · `forge test` 38/38 · fuzz 4×256 · invariants 3/3 · Slither 29 results 0 high/medium · simulate 6 rows · live dry-run OK.
- Promo: `check_timeline.py` → 0 errors, 8 warnings (design holds); `qa.py` exit 0 (all PASS except designed-hold WARNs); HyperFrames `lint` 0 errors, 19 warnings (studio-editability only).
- Demo-UI gates pasted in `docs/QA.md` (Playwright 33/33, Vitest 19/19, tsc/ESLint/build/axe 0).

## Blockers

- **Testnet E2E (MVP 4.6):** requires a testnet key + faucet funds; hard rules forbid requesting/storing/using them. Local lifecycle + dry-run stand in.
- No promo blockers. `pnpm preview` is running on port 4173.

## Open questions

1. Hydro hINJ/yINJ EVM existence — `[UNVERIFIED]` (no testnet addresses; resolves when Hydro publishes them).
2. Injective-EVM audit coverage for Accumulated contracts — `[UNVERIFIED]` (audited-commit vs deployed-bytecode diff not run).
3. DEX liquidity + stINJ→INJ queue latency — `[UNVERIFIED]` (not needed: redemption pays LST units).
4. Name collisions Quench/qINJ/QNCH — reported, not certified (Culligan Quench is the only material collision).
5. Alchemix BUSL 1.1 licence — unresolved legal risk (clean-room MVP; production needs a licence).
6. Lab vitals thresholds — unmeasured (see QA.md).
7. Independent critique pass — not run for the demo UI (see QA.md); run for the promo film and fixed in docs/promo/QA.md.
8. Should redemption remain borrower-exit-only in the MVP (no third-party redeem), or should a future change add earmarked third-party redemption? (MVP: borrower-exit only — pool drain prevented.)

## Backlog (out of scope for this change)

- Full-loop E2E is timing-sensitive (Wellspring auto-harvests per chunk); the engine test is the proof of zero-debt reachability.
- `page.goto('/app/overview')` 404s (overview is the `/app` index); in-app nav is correct — spec-only cleanup.
- Landing JS is ~5.7 kB gzip (well under the 300 KB target); React client dominates the bundle.
- MCP vitals lane (Chrome traces + CrUX, opt-out flags documented in DEPENDENCIES) — use after restart.
- Promo: tighten to 35-45 s, or add local-TTS voice, on user instruction.

## File map

- `docs/BRIEF.md` — verbatim project brief (unedited).
- `docs/DESIGN.md` — v4 design system (dealt warm-black-gold, composition, motion).
- `docs/QA.md` — gates, E2E/state/a11y evidence, investor-attack pass, score table.
- `docs/promo/` — BRIEF, CLAIMS, ASSETS, QA for the film.
- `docs/CASE-STUDY.md`, `docs/DEMO-SCRIPT.md`, `docs/DEPENDENCIES.md`.
- `docs/RISKS.md` — MVP threat model + clean-room statement.
- `web/README.md` — run/build commands + headless note.
- `openspec/changes/build-quench-demo-ui/` — proposal, design, spec (`demo-ui`), tasks.
- `openspec/changes/build-quench-mvp/` — implemented (groups 1–5 ticked with evidence).
- `openspec/changes/build-quench-promo-video/` — proposal, design, spec (`promo-video`), tasks.
