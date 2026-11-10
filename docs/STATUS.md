# STATUS

**Current phase:** `fork-alchemix-v3` — **design stop (awaiting user review)**. The user pivoted (2026-11-10) from the clean-room MVP to the real Alchemix V3 fork for the Quench use case (testnet-only, non-production, BUSL 1.1 terms). Planning artifacts complete and validated: proposal, design (F1–F11), 5 delta specs, tasks. Fork vendored as pinned submodule `alchemix-v3/` @ `b7712509…`; unpatched tree builds (BUILD_RC=0). Next: user answers the 5 design questions (design.md "Open Questions"), then implementation per tasks 1.1–7.5. `build-quench-demo-ui` v32 + promo film remain shipped records; `build-quench-mvp` is frozen as the clean-room record.

**Last action (2026-11-10):** Drafted the complete `fork-alchemix-v3` planning set after recon: cloned upstream as a pinned submodule with recursive deps (8 approved fetches; `lib/vault-v2` is in-tree vendored Morpho VaultV2), read AlchemistV3/Transmuter/AlTokenV3/deploy scripts, verified on-chain: `myt` interface surface is ERC-20 + `convertToAssets/convertToShares` only (⇒ wstINJ can serve directly), stINJ↔INJ 1:1 at the minter (previews + zero fees), Cancun opcodes supported on 1439 (MCOPY/TSTORE/PUSH0 probes), block time ≈0.55 s, unpatched fork builds with local forge (BUILD_RC=0). Key decisions: F2 asset mapping (myt=wstINJ, underlying=stINJ, debt=qINJ), F3 deploy set (core only, MYT layer excluded), F4 params (50% LTV, 0.5% protocol fee, 7-day vesting in blocks), F6 minimal renames now + full rename as pre-production gate, F7 keeps V3 redemption-driven repayment (documented BRIEF divergence). Claims C24–C30 added to `docs/research.md`. `openspec validate fork-alchemix-v3 --strict` → valid.

**Previous (2026-11-10):** UI v32 + promo v32 (Withdraw tab; rebuilt stereo score + ducked VO mix; gates `typecheck 0 · lint 0 · build OK · Vitest 19/19 · Playwright 36/36 · axe 0 · qa.py PASS · cuts PASS`, −15.32 LUFS / TP −1.36 dBTP). Before that: MVP groups 1–5 complete (`build-quench-mvp`: 38/38 tests, Slither 0 high/med, dry-run OK; on-chain E2E blocked by no-keys rule).

**Also shipped 2026-11-10 (demo UI + promo v33):** plain-language sweep — `Basin`/`Wellspring`/`Confluence`/`harvest` removed from every user-visible string in `web/src` and from the film (internal identifiers unchanged). **ElevenLabs** male VO (`eleven_multilingual_v2`, `Daniel — Steady Broadcaster`) replaces Kokoro; key read from `ELEVENLABS_API_KEY`, never committed. Captions now match the VO word for word. Trust scene rebuilt as a dark instrument panel (was a white card pasted on black); end card full-bleed cobalt; every cut is a branded cobalt wipe (crossfade removed). `Self-liquidate` moved from a solid orange block to a quiet heat-tinted surface. Gates: `typecheck 0 · lint 0 · build OK · Vitest 19/19 · Playwright 36/36 · axe 0 · qa.py exit 0, no FAIL`, −15.42 LUFS / TP −1.16 dBTP. Details in `docs/QA.md` V33 and `docs/DESIGN.md` V14.

**Next step:** User reviews `openspec/changes/fork-alchemix-v3/design.md` and answers the 5 open questions (protocol fee 50 vs 10 bps; vesting 7 vs 28 d; naming scope F6; max LTV 50% vs upstream 90%; MVP supersession at archive). On answers → implement tasks 1.1–7.5 to completion. Commits pending: demo-UI/promo work, MVP, and the fork change (submodule + `.gitmodules` + patches) — commit the fork only under the recorded amendment.

## Validation / status results (as-is)

- `openspec validate fork-alchemix-v3 --strict` → exit 0: `Change 'fork-alchemix-v3' is valid`.
- Fork recon (2026-11-10): `FOUNDRY_PROFILE=lite forge build` in `alchemix-v3/` → BUILD_RC=0 (unpatched); cancun opcode probes OK; stINJ↔INJ 1:1 + zero fees; wstINJ rate 1.002369; block time ≈0.55 s; claims C24–C30.
- `openspec validate build-quench-mvp --strict` → exit 0 (frozen record).
- MVP (frozen): 38/38 tests · fuzz 4×256 · invariants 3/3 · Slither 29 results 0 high/medium · simulate 6 rows · live dry-run OK.
- `openspec validate build-quench-promo-video --strict` / `build-quench-demo-ui --strict` → exit 0.
- Promo: `check_timeline.py` 0 errors (8 design-hold warnings); `qa.py` exit 0; HyperFrames lint 0 errors.
- Demo-UI gates pasted in `docs/QA.md` (Playwright 36/36, Vitest 19/19, tsc/ESLint/build/axe 0).

## Blockers

- **Design stop:** `fork-alchemix-v3` awaits user review (5 questions in design.md) before implementation.
- **Testnet E2E (both changes):** requires a testnet key + faucet funds; hard rules forbid requesting/storing/using them. Dry-runs + local tests stand in.

## Open questions

1. Design review (fork): fees (50 vs 10 bps), vesting (7 vs 28 d), naming scope (F6), LTV (50% vs upstream 90%), MVP supersession at archive — see `openspec/changes/fork-alchemix-v3/design.md` "Open Questions".
2. Hydro hINJ/yINJ EVM existence — `[UNVERIFIED]` (no testnet addresses; resolves when Hydro publishes them).
3. Injective-EVM audit coverage for Accumulated contracts — `[UNVERIFIED]` (audited-commit vs deployed-bytecode diff not run).
4. DEX liquidity + stINJ→INJ queue latency — `[UNVERIFIED]` (not needed: redemption pays LST units).
5. Name collisions Quench/qINJ/QNCH — reported, not certified (Culligan Quench is the only material collision).
6. Alchemix BUSL 1.1 production licence (Friendly Fork) — unresolved legal risk; tracked as a pre-production gate.
7. Lab vitals thresholds — unmeasured (see QA.md).
8. Independent critique pass — not run for the demo UI (see QA.md); run for the promo film and fixed in docs/promo/QA.md.
9. Third-party (non-borrower) redemption — the MVP was borrower-exit-only; the fork uses upstream Transmuter flow for all qINJ holders (supersedes this question if the fork proceeds).

## Backlog (out of scope for this change)

- Full-loop E2E timing sensitivity (engine test is the zero-debt proof) — demo-UI only.
- `page.goto('/app/overview')` 404s (overview is the `/app` index); in-app nav correct — spec-only cleanup.
- Landing JS ~5.7 kB gzip (under 300 KB budget); React client dominates the bundle.
- MCP vitals lane (Chrome traces + CrUX, opt-out flags documented in DEPENDENCIES) — use after restart.
- Promo: tighten to 35–45 s or add local-TTS voice, on user instruction.
- Post-testnet fork upgrade: deploy a real VaultV2 MYT with a wstINJ strategy (design F2 alternative).

## File map

- `docs/BRIEF.md` — verbatim project brief (unedited; amendments in AGENTS.md).
- `docs/DESIGN.md` — demo-UI design system (frozen v30+).
- `docs/QA.md` — demo-UI gates.
- `docs/promo/` — film BRIEF, CLAIMS, ASSETS, QA.
- `docs/CASE-STUDY.md`, `docs/DEMO-SCRIPT.md`, `docs/DEPENDENCIES.md`.
- `docs/RISKS.md` — MVP threat model + clean-room statement (fork rows added in tasks 7.4).
- `docs/research.md` — claims register C1–C30 + link log.
- `alchemix-v3/` — pinned fork submodule (never edited directly).
- `src/`, `test/`, `script/`, `foundry.toml`, `README.md` — frozen clean-room MVP.
- `openspec/changes/fork-alchemix-v3/` — proposal, design (F1–F11), specs (basin/qinj/confluence/protocol-safety/fork-tooling), tasks.
- `openspec/changes/build-quench-mvp/` — frozen completed record.
- `openspec/changes/build-quench-demo-ui/`, `openspec/changes/build-quench-promo-video/` — shipped records.
