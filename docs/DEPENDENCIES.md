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

---

# Video stack review — 2026-11-09

Requested review of the video skills/repos before `build-quench-promo-video`. Licence values are from the repository `LICENSE` file or GitHub licence API, fetched 2026-11-09. "Read" names the files actually opened, not the repo landing page.

| Item | Licence (verified) | What it is | Read | Verdict |
|---|---|---|---|---|
| **HyperFrames** `heygen-com/hyperframes` | Apache-2.0 | HTML + GSAP → deterministic MP4; CLI 0.8.150 cached locally | `hyperframes/SKILL.md`, `hyperframes-core` contract, `hyperframes-cli`, `hyperframes-creative`, `hyperframes-studio`, `hyperframes-animation`/`audio`/`keyframes`/`registry` headers; `doctor` | **Use.** Renderer and composition contract. No install needed; cached binary at `~/.npm/_npx/702923228c2ce1e6/node_modules/.bin/hyperframes`. |
| **Remotion** | Two-tier: free for individuals / ≤3 employees, paid company licence above that | React renderer | `LICENSE.md` (fetched) | **Do not use.** Licence fit for this organisation is unconfirmed; HyperFrames already covers the render. |
| **video-director** `win4r/video-director` | MIT | Direction gates + `check_timeline.py` + `qa_video.py` (ffmpeg/numpy/Pillow) | `SKILL.md` (all 390 lines), `scripts/check_timeline.py` (308 lines), `scripts/qa_video.py` (708 lines, read API/report sections) | **Use as QA reference; adapt scripts with attribution.** Its evals are single-run and self-reported, so no benchmark claim is made. |
| **video-shotcraft** `Vincentwei1021/video-shotcraft` | Apache-2.0; bundled BGM Mixkit / per-file; SFX from Freesound per project | 124 shot cards, Remotion pipeline, beat sync, sound design | `SKILL.md` (all 286 lines), `references/pipeline.md`, `references/sound-design.md`, `assets/audio/ATTRIBUTION.md`, `LICENSE` | **Reference only.** Its capture doctrine (real 2× screenshots, deterministic renders, holds, independent review) informs the brief. No code or audio copied; Remotion path not used. |
| **brag** `latent-spaces/brag` | MIT; bundled music CC BY 4.0 (ende.app) | Fast HyperFrames launch cut | `SKILL.md`, `README.md`, `LICENSE`, music/SFX inventory | **Optional reference, not used.** Its bundled music is licensed, but this film gets an original synthesized score. |
| **lemo-opuscar** `lemomo-ai/lemo-opuscar` | MIT code/docs; demo films CC BY 4.0; six voice tracks excluded | 66 style prompts + demo films | `styles/dark-keynote/STYLE.md` (all), `styles/living-screencast/STYLE.md` (all), `README.md` licence section | **Direction only.** Dark Tech Keynote grammar (one accent, hairline grid, UI as protagonist) is the closest match. No plugin installed (it downloads on first use); no demo footage reused. |
| **chaojifeng-video-design** `mileson/chaojifeng-video-design` | MIT code; vendors lemo-opuscar; gallery songs keep their own rights | Chinese video-design methodology, style packs | `SKILL.md`, `THIRD_PARTY_NOTICES.md` | **Skip.** It vendors lemo's MIT styles and its gallery music is not cleared; low marginal value over lemo + video-director. |
| **motion-prompt** `showheyohtaki/motion-prompt` | MIT | 192 names for motion/camera/UI effects + gallery | `README.md`, `LICENSE` | **Vocabulary reference only.** Useful for naming moves precisely (push-in, whip pan, match cut). No install. |
| **huashu-motion** `alchaincyf/huashu-motion` | MIT; GSAP under its own licence; bundled fonts OFL; mascot excluded | Full competing HTML→video CLI + editor | `README.md`, `LICENSE`, `THIRD_PARTY.md` | **Skip.** It is a parallel renderer/pipeline; adopting it would duplicate HyperFrames. |
| **story-studio** `konlu/story-studio` | **CC BY-NC-SA 4.0** | Topic → script → TTS → images → CapCut/Jianying draft | `README.md`, `LICENSE` | **Exclude.** Non-commercial licence is incompatible with a commercial promo; output targets CapCut, not HyperFrames. |
| **Local skills** `/home/abdul-mannan/Desktop/6figs/.agents/skills` | mixed, see above | 22 installed skills | All 22 `SKILL.md` headers + H2 maps; full reads of `product-launch-video`, `embedded-captions` (core), `hyperframes-creative`, `hyperframes-studio`, `brag` | **Use selectively.** `hyperframes*` + `product-launch-video` workflow + `embedded-captions` rail doctrine. `talking-head-recut`/`pr-to-video`/`faceless-explainer`/`slideshow`/`figma` are out of scope. |

## What the review changed

1. **Renderer:** HyperFrames only. Remotion is not installed and its licence threshold is not assumed.
2. **Capture:** real 2× Playwright screenshots, never redrawn UI (shotcraft + video-director agree; lemo's living-screencast redraw is explicitly not used because it would invent UI).
3. **QA:** adopt video-director's measurable gates (hook by 3 s, rendered text size/contrast, frame 0, freezes, cuts, loudness/true peak) and its contact-sheet approach, implemented locally.
4. **Captions:** one rail, burned in, inside title-safe 80%, plus `.srt`; no talking-head matting.
5. **Audio:** original synthesized score/SFX. No bundled track from brag, shotcraft, lemo or chaojifeng is used, so no music-licence dependency.
6. **Excluded:** story-studio (NC), Remotion (licence), chaojifeng (vendored + music rights), huashu (duplicate pipeline), lemo plugin (downloads on first use).

## Sources fetched

- `https://api.github.com/repos/{owner}/{repo}` — licence, stars, pushed date (2026-11-09).
- `https://raw.githubusercontent.com/{owner}/{repo}/HEAD/LICENSE` — each licence text.
- `https://raw.githubusercontent.com/remotion-dev/remotion/main/LICENSE.md` — free/company threshold.
- `https://raw.githubusercontent.com/Vincentwei1021/video-shotcraft/HEAD/assets/audio/ATTRIBUTION.md` — Mixkit BGM terms.
- `https://raw.githubusercontent.com/latent-spaces/brag/HEAD/README.md` — music credit.
- `https://raw.githubusercontent.com/konlu/story-studio/HEAD/LICENSE` — CC BY-NC-SA 4.0.
