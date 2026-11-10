# Quench — web demo

React + Vite + TypeScript SPA. **Simulated only** — no wallet, no RPC, no contracts. Every screen carries "Simulated · contracts not deployed" in simulated mode (the default).

## Quick start

```bash
cd web
pnpm install
pnpm dev      # http://localhost:5173
pnpm preview  # production preview, http://localhost:4173 (used for QA screenshots)
pnpm build    # tsc --noEmit && vite build → dist/
pnpm test     # vitest (19 engine tests)
pnpm lint     # eslint
pnpm typecheck
```

Mode flag:

```bash
VITE_QUENCH_MODE=simulated pnpm dev        # default
VITE_QUENCH_MODE=testnet pnpm build:testnet # testnet stub (no simulation code in the bundle)
```

The testnet client is a stub that throws "contracts are not wired in this change" — it invents no address and no ABI. The UI imports only the `QuenchClient` domain interface (see `src/client/types.ts`); the concrete client is chosen by `createQuenchClient()` from the mode flag.

## Project layout

```
web/
  src/
    client/
      types.ts            # QuenchClient interface, Snapshot, bigint amounts
      config.ts           # one place for all financial literals + SOURCES
      math.ts             # fixed-point helpers
      simulated/engine.ts # deposit/mint/harvest/redeem/withdraw/liquidate + risk states
      simulated/SimulatedClient.ts
      testnet/TestnetClient.ts  # stub
      faulty/FaultyClient.ts    # error-state tests
      createClient.ts     # mode flag → client (dynamic import)
      QuenchProvider.tsx  # useSyncExternalStore provider
    components/           # shell, buttons, banners, drawers, curves, gauges
    pages/                # Landing, Overview, Basin, Borrow, Wellspring, Confluence, Activity
    domain/curve.ts       # pressure-curve projection
    styles/               # tokens (v2), base, landing, app
  tests/e2e/visual.spec.ts # Playwright flows + axe + screenshots
  scripts/                # vitals / lighthouse helpers (run manually)
```

## Headless vs headed Playwright

On this machine the Playwright **headless shell** (`chromium_headless_shell-1248`) was never downloaded, so default headless launches fail with "Executable doesn't exist". The repo config (`playwright.config.ts`) therefore uses `browserName: chromium` + `headless: false` (full Playwright Chromium 1248, installed via `pnpm exec playwright install chromium`). If you run in CI with no display:

- either install the headless shell too (`pnpm exec playwright install chromium` already does this on a fresh machine), or
- override with `pnpm exec playwright test --headed=false` / your CI flag.

The full-loop Playwright test is timing-sensitive: Wellspring auto-harvests on every 30-day chunk of a fast-forward, so "+5 years" in one click may not reach zero-debt before the rate exits bounds. Run the E2E loop as a manual multi-click sequence (the demo script does this) or accept the engine test as the proof of zero-debt reachability. This is logged in `docs/QA.md` and is not a product issue.

## Design docs

- `docs/DESIGN.md` — tokens, type, layout, contrast, rejected alternatives (v2 included).
- `docs/CASE-STUDY.md` — concept, 5 decisions with rejected alternatives, 3 details tied to screenshots.
- `docs/DEMO-SCRIPT.md` — 90-second presenter walkthrough.
- `docs/DEPENDENCIES.md` — every npm package: name, pinned version, licence, maintainer, why.
- `docs/QA.md` — gates, test counts, screenshots, score table, [UNVERIFIED] list.
