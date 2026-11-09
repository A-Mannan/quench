# STATUS

**Current phase:** `build-quench-demo-ui` v9 shipped — blue system on `cool-grey-cobalt` (day paper-blue, night lab-blue), drop mark `+ lowercase quench` logotype, app reskinned to match the landing. `build-quench-mvp` stays paused (no `src/` until a separate GO + G1). `build-quench-mvp` stays paused (no `src/` until a separate GO + G1).

**Last action (2026-11-09):** v9 blue-system pass: drop mark (magnifier killed), `quench` lowercase logotype, grouped rail with solid cobalt active tab, segmented Day/Night everywhere, blue-tinted day/night tokens, designed neutral disabled states, banner/toast layout fixes, E2E dual-nav selector hardening. Gates: tsc 0, ESLint 0, Vitest 12/12, build 0, Playwright **33/33** (3 workers, 54.2s), axe 0. See `docs/DESIGN.md` v9/v11 + `docs/QA.md` v9/v11 addenda, shots `web/screenshots/v9/`–`web/screenshots/v11/`. Swapped fonts (Schibsted + JetBrains Mono), rebuilt landing composition (100svh hero with full-bleed curve, loop band, curve lab, type-moment exits, letters-assemble statement, risk ledger, unified close+footer), de-chromed app panels, fixed the teal vessel remnant, widened the rate band (1.25→2.50; spike +30%→+160%) so long-horizon compounding stays in-bounds, made the E2E sim clicks reliable (600 ms waits), restructured the full-loop test into two sessions (redeem-then-reset-then-zero-debt, because any redeemed qINJ makes zero-debt unreachable), and installed the Playwright headless shell with `headless: true`. Packaged the whole loop green: **11/11 Playwright headless, 12/12 Vitest, tsc 0, ESLint 0, build 0, axe 0 violations.**

**Next step:** User reviews v4 (`pnpm preview` at http://127.0.0.1:4173, or `cd web && pnpm dev`). Then the remaining QA: lab vitals (LCP/INP/CLS, currently [UNVERIFIED]), independent critique pass, Lighthouse per route. MCP (`chrome-devtools-mcp@1.12.0`, wired in `~/.config/opencode/opencode.json`) activates after an OpenCode restart.

## Validation / status results (as-is)

- `openspec validate build-quench-demo-ui --strict` → exit 0: `Change 'build-quench-demo-ui' is valid`.
- `openspec status --change build-quench-demo-ui --json` → planning complete, artifacts done.
- Gates pasted in `docs/QA.md`. Headless full suite: 11/11 in ~53s.

## Blockers

- **G1 (protocol change `build-quench-mvp`):** user must review specs and design before any `src/`. Group 3 is blocked until then.
- No demo-UI blockers. `pnpm preview` is running on port 4173.

## Open questions

1. Which LST: Hydro hINJ/yINJ or Accumulated stINJ/wstINJ? (protocol change, task 1.5)
2. Does the LST path work on Injective EVM, or is 0x66 native delegation justified? (protocol)
3. Liquid redemption route and worst-case delay (7 days illustrative; protocol owns it)
4. Slashing policy: liquidation or loss socialisation, and parameters?
5. maxLTV (50%), fees (0.50%), redemption term (7 days) — illustrative; protocol owns simulation
6. Name collisions Quench/qINJ/QNCH — reported, not certified (protocol research)
7. Alchemix BUSL 1.1 licence — unresolved legal risk (clean-room demo only)
8. Chosen LST testnet address, WINJ, faucet — protocol research
9. QNCH stub placement (interface-only vs no artifact) — G1 review
10. Lab vitals thresholds — unmeasured (see QA.md)
11. Independent critique pass — not run (see QA.md)

## Backlog (out of scope for this change)

- Full-loop E2E is timing-sensitive (Wellspring auto-harvests per chunk); the engine test is the proof of zero-debt reachability.
- `page.goto('/app/overview')` 404s (overview is the `/app` index); in-app nav is correct — spec-only cleanup.
- Landing JS is ~5.7 kB gzip (well under the 300 KB target); React client dominates the bundle.
- MCP vitals lane (Chrome traces + CrUX, opt-out flags documented in DEPENDENCIES) — use after restart.

## File map

- `docs/BRIEF.md` — verbatim project brief (unedited).
- `docs/DESIGN.md` — v4 design system (dealt warm-black-gold, composition, motion).
- `docs/QA.md` — gates, E2E/state/a11y evidence, investor-attack pass, score table.
- `docs/CASE-STUDY.md`, `docs/DEMO-SCRIPT.md`, `docs/DEPENDENCIES.md`.
- `web/README.md` — run/build commands + headless note.
- `openspec/changes/build-quench-demo-ui/` — proposal, design, spec (`demo-ui`), tasks.
- `openspec/changes/build-quench-mvp/` — paused; G1 gate stands.
