# Dependencies — web demo

All versions pinned exact in `web/package.json`. `web/pnpm-lock.yaml` committed. Licences are permissive (MIT / OFL / Apache-2.0). No wallet or chain library.

| Package | Pinned | Licence | Maintainer | Why |
|---|---|---|---|---|
| `react` | 19.3.1 | MIT | Meta | UI runtime |
| `react-dom` | 19.3.1 | MIT | Meta | DOM renderer |
| `react-router-dom` | 7.18.4 | MIT | Remix | Route code-splitting |
| `@fontsource-variable/schibsted-grotesk` | 5.3.0 | OFL-1.1 | Fontsource | Dealt display/body face (taste-skill `schibsted`); self-hosted, no Google Fonts at runtime |
| `@fontsource/jetbrains-mono` | 5.3.0 | OFL-1.1 | Fontsource | Dealt data face (`schibsted` pairing) |
| `@fontsource/ibm-plex-mono` | — | — | — | Removed in v4 (Anybody/Public Sans/IBM Plex Mono removed with the V1/V2 system) |
| `@phosphor-icons/react` | 2.1.10 | MIT | Phosphor | Single icon family, 1.6px stroke |
| `vite` | 8.3.5 | MIT | VoidZero | Build / dev server |
| `@vitejs/plugin-react` | 6.1.2 | MIT | Vite | React Fast Refresh |
| `typescript` | 6.0.3 | Apache-2.0 | Microsoft | Strict types. Pinned to 6.x because `@typescript-eslint` 8.x does not support TS 7.x (explicit error message; see QA). |
| `vitest` | 5.0.5 | MIT | Vitest | Engine tests |
| `@playwright/test` | 1.64.1 | Apache-2.0 | Microsoft | E2E + screenshots + axe |
| `@axe-core/playwright` | 4.14.0 | Mozilla Public 2.0 | Deque | WCAG 2.2 AA automation |
| `@testing-library/react` | 16.3.3 | MIT | Testing Library | Component tests |
| `@testing-library/jest-dom` | 7.0.1 | MIT | Testing Library | Matchers |
| `@testing-library/user-event` | 14.6.8 | MIT | Testing Library | Input simulation |
| `jsdom` | 30.1.3 | MIT | jsdom | Vitest environment |
| `eslint` | 10.13.0 | MIT | ESLint | Lint |
| `@eslint/js` | 10.0.1 | MIT | ESLint | JS rules |
| `typescript-eslint` | 8.72.1 | MIT | typescript-eslint | TS lint (see above) |
| `globals` | 17.13.0 | MIT | ESLint | Env globals |
| `lighthouse` | 13.5.0 | Apache-2.0 | Google | Lab vitals (not run standalone this session; see QA) |
| `@types/node` | 26.6.5 | MIT | DefinitelyTyped | Node types |
| `@types/react` | 19.3.0 | MIT | DefinitelyTyped | React types |
| `@types/react-dom` | 19.3.0 | MIT | DefinitelyTyped | React DOM types |

## Skills and tools (no npm package)

- Taste Skill 2.5.1 (see below) (MIT, github.com/leonxlnx/taste-skill) — cloned to `/tmp/opencode/taste-skill`, `SKILL.md` + scripts read before use. Install name `design-taste-frontend`. Requires Node 22+ and Chrome (both present). Used for anti-slop critique loops.
- OpenDesign (Apache-2.0, github.com/nexu-io/open-design) — cloned to `/tmp/opencode/open-design`. Used for the craft layer (anti-ai-slop, typography, color, state-coverage, animation-discipline, accessibility-baseline) and to consult the Stripe package (not adopted as identity).
- Taste deal (2026-11-09): `start.mjs deal --page software --trade fintech` → `warm-black-gold` + `schibsted` + `nav-cards` / `footer-statement` / `close-word` / `space` / `tonal` / `dots`; moment `letters-assemble`. Card reads `site-kind: software` on `<html data-type="software">`.
- Local skill set at `/home/abdul-mannan/Desktop/frontend/launchpad-ui-3/.agents/skills/` — read `SKILL.md` files for design-taste-frontend, frontend-design, impeccable, animate, review-animations, improve-animations etc. before use; applied their checklists in the QA critique loop.
