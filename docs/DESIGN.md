# Quench — Design System

**Design read (taste-skill deal, 2026-11-09):** software-kind page for investors, DeFi users and first-time borrowers, with a warm-black-gold studio language, — exact deal: `node scripts/start.mjs deal --page software --trade fintech` → palette `warm-black-gold`, type `schibsted` — and live data (the debt curve) as the picture. Deal also: nav-cards, footer-statement, close-word, space, tonal, dots; moment `letters-assemble`. V4 follows `layout-v4.md` (one section per screen), `system.md` (one system), `motion.md` (hero entrance + one moment + hover layer), `copy-voice.md` (voice card: technical-dry).

**Concept — The Cooling Ledger (v4: black-gold instrument).** The Cooling Ledger treats debt as pressure under a fixed vessel. V4 makes it literal: the hero is exactly one screen whose picture is the pressure curve itself, full-bleed — not a card beside the title. The loop is a connected sequence band. The exits are a type moment (giant 21 days struck against ≤ 7 days in gold). A dealt `letters-assemble` statement (“Debt falls.”) owns its screen. for debt. Collateral is the vessel; debt is pressure; LST yield is coolant. The interface treats every number as an instrument reading, every action as a valve, and every risk as a physical consequence. The product is not a dashboard of cards. It is one continuous instrument you read from left to right: pressure, coolant flow, headroom, exit.

The concept comes from the subject, not from DeFi chrome. A loan is a pressurised system. A self-repaying loan is a system with a coolant loop. Quench is the control room for that loop. This gives the interface a vocabulary that is specific to the product: vessels, gauges, valves, flow, headroom, pressure tests, coolant, heat, and a hard boundary at zero.

## 1. Why this does not swap with another DeFi brief

Hide the logo and Quench should still read as Quench. The system uses:

- a **warm-black studio field** (#0c0a08) with gold (#c9a45a) as the sole accent — the dealt fintech palette, not a mint/teal DeFi field;
- **Schibsted Grotesk at 400** (dealt pairing, Google Fonts via self-hosted `@fontsource` for runtime) with JetBrains Mono for data — tracked -0.018em display, sentence case, never tracked capitals;
- **one continuous pressure curve** as the hero, not a stat row, gradient orb, or card grid;
- **quiet rounded instruments** (16 px radius, 1 px border, no shadow) — and in the hero, *no panel at all*: the curve is the picture, edge-to-edge;
- **copy that names consequences** ("Burning qINJ reduces debt; it does not return collateral") rather than "Safe", "Sustainable", "Next-gen";
- **flat warm-black fields with hairline structure** instead of gradient washes, glassmorphism, or orbs;
- **no stock 3D coins, orbs, water drops, emoji, or tracked all-caps eyebrows**;
- **numbered markers only in the four-step loop**, where the content is genuinely a sequence.

Rejected alternatives, deliberately:

| Alternative | Why rejected |
|---|---|
| Near-black + acid green "crypto terminal" | The default dark-tech tell; makes risk feel like a game and hides the human consequence. |
| Warm cream + serif + terracotta | The current AI-design default for "premium"; it would make Quench indistinguishable from a dozen editorial fintechs. |
| Navy + violet gradients + glass cards | Generic DeFi SaaS; no relationship to pressure, cooling or repayment. |
| Literal water photography / 3D droplets | Quench is a financial mechanism, not a beverage. The metaphor must be structural, not decorative. |
| Card grid for every metric | Data is the hero; a card grid would make the debt curve secondary. |

## 2. Colour

Colour is functional. **Coolant teal** is the single accent. **Heat rust** is semantic only: debt above the user's comfort line, rate drops, failed transactions, liquidation eligibility. **Yield green** is semantic only: repayment, confirmed, healthy. Amber is semantic only: stale rate, wrong network, queue. The accent never appears more than twice on a screen: one primary action and one active state.

| Token | Hex (v4 deal) | Role | Contrast on `--bg` | Contrast on `--surface` |
|---|---|---|---|---|
| `--bg` | `#0C0A08` | cool mineral field | — | — |
| `--surface` | `#181512` | raised instrument panel | — | — |
| `--ink` | `#FFFFFF` | primary text | 15.9:1 | 17.1:1 |
| `--muted` | `#8F8A84` | secondary text | 5.4:1 | 5.6:1 |
| `--line` | `rgba(255,255,255,0.12)` | hairline structure | 1.3:1* | 1.2:1* |
| `--accent` | `#C9A45A` | coolant / primary action | 5.8:1 | 6.1:1 |
| `--accent-strong` | `#DCBF7E` | accent text / pressed | 9.1:1 | 9.6:1 |
| `--danger` | `#E07A5F` | heat / risk / failure | 5.1:1 | 5.4:1 |
| `--warn` | `#D9A441` | stale / queue / wrong network | 5.2:1 | 5.6:1 |
| `--success` | `#7FB069` | repaid / confirmed / healthy | 5.7:1 | 6.0:1 |
| `--white` | `#FFFFFF` | text on accent/danger | 6.6:1 on accent | 5.9:1 on danger |

\* `--line` is a non-text structural token; it is not used for body copy. Focus indicators use `--accent-strong` against `--bg` (8.89:1) and a 2 px offset, clearing WCAG 2.2 non-text contrast.

Rules:

- Body text and muted text never sit on `--accent` or `--danger`; those surfaces use white text, which clears 4.5:1.
- The accent is not used for body links when a primary CTA is present; links are ink with a 1 px underline.
- Semantic colour is never the only signal: every status also has a label and an icon/shape.
- The halftone field is made from `--ink` at 6–10% opacity, not a gradient. It is a texture, not a colour wash.

## 3. Typography

**Display: Schibsted Grotesk Variable (OFL-1.1), dealt pairing.** Weight 400 at display sizes (the deal's signature: light, not bold), tracking -0.018em to -0.035em. Body same face at 400/500. Data: JetBrains Mono (400/500). Self-hosted via `@fontsource` (no Google Fonts at runtime, per our no-third-party rule). Rejected: Anybody (V1/V2 — read as a nameplate), Inter, Geist, Satoshi, Space Grotesk, Fraunces, Instrument Serif.

**Body: Schibsted Grotesk (same face).** 16px/1.65 for reading text in `--ink` at 7:1+; `--muted` (4.5:1+) only for labels, meta and the grey run-on. Sentence case everywhere. Rejected: a second display face, a serif for "premium", or a mono for body text.

**Data: JetBrains Mono (OFL-1.1).** Tabular numerals; amounts, rates, timestamps, addresses and value-attached labels. Only data labels are uppercase (11px, 500, 0.05em tracking) — no tracked eyebrows above headings, per taste `system.md`.

Scale:

| Role | Size | Line height | Tracking | Face |
|---|---|---|---|---|
| Display XL (hero) | `clamp(3.4rem, 6.5vw, 5.6rem)` | 0.95 | -0.035em | Schibsted 400 |
| Display L (close) | `clamp(2.75rem, 6vw, 4.5rem)` | 1.0 | -0.03em | Schibsted 400 |
| H1 (section) | `clamp(2rem, 4vw, 2.75rem)` | 1.04 | -0.022em | Schibsted 400 |
| H2 (panel) | `1.35rem` | 1.1 | -0.015em | Schibsted 640 |
| H3 | `1.25rem` | 1.2 | -0.01em | Public Sans 650 |
| Body L | `1.125rem` | 1.55 | 0 | Public Sans 400 |
| Body | `1rem` | 1.55 | 0 | Public Sans 400 |
| Small | `0.875rem` | 1.45 | 0.01em | Public Sans 450 |
| Data L | `2rem` | 1.0 | -0.01em | IBM Plex Mono 500, tabular |
| Data | `0.875rem` | 1.3 | 0.01em | IBM Plex Mono 500, tabular |
| Label | `0.6875rem` | 1.2 | 0.08em | IBM Plex Mono 500, uppercase |

Only data labels use uppercase, and only because they annotate a value. There are no tracked all-caps eyebrows above headings. Headings are sentence case.

## 4. Layout

- Grid max width 1280 px, one section per screen (`layout-v4.md`): hero exactly 100svh; sections padded 120 top / 72 bottom (96/48 under 640); ground changes only at section edges (no hairline boxes standing in for grounds).
- The landing alternates full-bleed instrument bands with an asymmetric 7/5 or 8/4 split. No section uses the same split twice.
- App shell: 248 px left rail at ≥1000 px; top instrument bar; content area on a 12-column grid. At <1000 px the rail becomes a bottom navigation bar; at 375 px the content is one column with the simulation dock as a bottom sheet.
- V4 panels are **quiet rounded instruments**: 16 px radius, 1 px `--line` border, **no shadow**. The hero curve is not a panel — it is the hero picture, edge-to-edge. One button shape (tonal, 10 px radius, 46 px), one hairline, one link look across the page (`system.md`).
- Amount inputs are full-width, mono, with the unit set as a suffix and a `MAX` control at least 44×44 px.
- Every action has a consequence block immediately below it: what leaves the wallet, what happens to debt, what can be undone. The primary button is never the only explanation.
- Empty states are compositions, not grey boxes: a vessel outline with a "Deposit to pressurise" instruction and a single action.

## 5. Data graphics

**The pressure curve** is the signature graphic. It is a custom SVG, not a chart library. It shows:

- the debt line falling from mint to zero;
- a shaded headroom band between debt and `collateralValue × maxLTV`;
- a vertical "pressure" gauge at the right with the current LTV;
- a dot at the current point and a ghosted projection to zero;
- axes labelled in INJ and months, with a source/assumption line beneath.

The app's overview uses the same curve at full width. The landing uses an interactive version with two controls (LTV and APR) that redraws the curve and prints the months-to-zero. The graphic is the argument: a self-repaying loan is a debt curve with a coolant loop.

Other data graphics: a horizontal **headroom bar** with a hard boundary mark, a **buffer gauge** for Confluence capacity, and a **flow diagram** for the loop. All are SVG/CSS; no chart library; no gradients.

## 6. Motion

Motion (v4, per `motion.md`): one hero entrance (h1 lines + lead + actions staggered once on load, ~700 ms, then the hero stands), one dealt moment (letters-assemble “Debt falls.” — scroll-triggered, plain text at rest, 700 ms safety fallback, reduced-motion disables), and the hover layer (card lift 2 px, button step 1 px + press scale 0.985, links draw an underline). App motion is state feedback only. No fade-up on scroll. No looping background. No parallax.

Tokens:

- `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`
- `--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)`
- `--dur-press: 140ms`, `--dur-state: 200ms`, `--dur-panel: 260ms`, `--dur-hero: 700ms`
- `prefers-reduced-motion: reduce` removes the hero draw, count-ups, pulse and drawer translation; all state changes remain instant and legible.

## 7. Voice

Plain verbs, sentence case, consequences before benefits. Examples:

- "Mint qINJ" → helper: "Debt rises by the amount minted. The 0.50% fee leaves your stINJ collateral, so headroom is slightly lower."
- "Harvest" → helper: "Wellspring burns qINJ from this wallet against your debt. Yield stays in the collateral."
- "Redeem qINJ" → helper: "You receive stINJ, not INJ. Worst case is a 7-day queue if the buffer is empty."
- "Withdraw" → helper: "Only available at zero debt. Pausing never blocks this exit."

Banned copy: "Safe", "Sustainable", "Next-generation", "Unlock the power", "Seamless", "Revolutionary", "Guaranteed", "Risk-free", "Audited" (unless a real audit is cited), invented TVL/users/partners, and any "✓ Safe" badge.

## 8. Accessibility and performance commitments

- WCAG 2.2 AA: body text ≥4.5:1, large text ≥3:1, focus visible at 2 px with 2 px offset, 44 px touch targets for primary controls, 24 px minimum for secondary, full keyboard operation, no keyboard traps.
- `prefers-reduced-motion` honoured; no content depends on motion.
- All data states have text equivalents; charts have `<title>`/`<desc>` and a table fallback in a disclosure.
- Type is self-hosted via `@fontsource` packages; no Google Fonts, no third-party runtime requests.
- Landing JS target ≤300 KB gzip; routes code-split; the app shell is the only shared chunk.

## 9. Sources used

- Awwwards evaluation criteria (Design 40, Usability 30, Creativity 20, Content 10), fetched 2026-11-09: https://www.awwwards.com/about-evaluation/
- Awwwards Sites of the Day, fetched 2026-11-09: https://www.awwwards.com/websites/sites_of_the_day/
- OpenDesign craft layer (anti-AI-slop, typography, colour, state coverage, animation discipline, accessibility baseline), Apache-2.0, inspected 2026-11-09: https://github.com/nexu-io/open-design
- Taste Skill 2.5.1 (MIT), inspected 2026-11-09: https://github.com/leonxlnx/taste-skill
- Refero/frontend-design guidance, read from the local skill set at `/home/abdul-mannan/Desktop/frontend/launchpad-ui-3/.agents/skills/`, 2026-11-09.

No Alchemix visual asset, layout or copy was copied. Alchemix docs were used for mental-model comparison only; the Quench loop follows the project brief, not Alchemix's redemption mechanics.
---

## V9 addendum (2026-11-09): the blue system

**User direction:** "more blue in the app, less white — like the Hermes Agent website theme (ours, not theirs); if the current design is already best, take it further until it beats it." Verdict: keep our dual-theme `cool-grey-cobalt` instrument, but make **blue the structure**, not an accent — solid cobalt active states, blue-tinted "whites", blue-black hairlines, dense mono data. Same palette family, more of it.

**Mark:** the old ring + diagonal tail read as a magnifying glass / search icon. A four-way study (vertical-stem Q, basin-bowl Q, drop, cooling loop, hex Q) settled it: a **drop with a liquid-level tick** — top bevels down to a circular belly, one horizontal rule inside at liquid height. The tick keeps Instrument Sans wordmark "quench" (lowercase, 700, −0.025em) distinct from any letterform; at 16px the drop alone survives. Favicon is the exact 4/3-scaled wordmark geometry on a cobalt field (verified pixel-identical proportions, not a redraw).

**Day:** `cool-grey-cobalt` paper is now blue paper — bg `#EDF0F6`, card `#F8FAFE` (blue-white, not pure white), card-2/surface `#E8EDF7`/`#DDE4F2`, hairlines `rgba(20,28,70,.13/.26)`. Rail reads blue-grey; panels float on shadow, not sentiment.

**Night:** lab light under blue rules — bg `#090B0F`, cards `#151A24`/`#1B2230`, blue-tinted borders `rgba(165,174,255,.10/.20)`, inset top highlight on panels, dark chart headroom 16%. Cobalt fill deepens to `#2E3BFF`; text accents stay `#A5AEFF` (fill/text split survives legibility).

**App chrome (v7–v9):** rail regrouped into **Instrument** (Overview, Basin, Borrow) + **Flow** (Wellspring, Confluence, Activity) with 44px targets and a **solid cobalt active tab** (white text) — the single confident blue per screen. Topbar dropped its duplicate Sources on desktop and the icon-only theme button: now a Day/Night **segmented control** everywhere (landing, gate, app). Disabled controls are a designed neutral (`--surface` + muted text), never faded cobalt. Panels/tokens unified to the 3px sharp family with real elevation (light soft, night inset); action strip lost its left-border accent (anti-slop). The empty state uses the real `Vessel` with an opacity-gated zero fill; the vessel readout sits in a legible plate above the liquid. Receipts auto-dismiss after 8s (hover/focus-paused) and stack **above** the Simulation trigger on phones instead of covering it; the toast layer dropped below the drawer. Banner grid no longer crushes its text column under 560px (flag/body on row one, action full-width below).

**Motion/verification:** unchanged discipline (150ms state, no scroll reveals; hero `data-enter` once; reduced-motion = static + unhidden). E2E selectors were only hardened for dual-breakpoint nav (`a[href="/app"]:visible`, `button:visible` Sources): identical clicks, viewport-honest.

## V10 addendum (2026-11-09): the app as a product

User: "Landing is good, but the app still does not look." Review of All Six app screens (populated states, `web/screenshots/v10/`) found the app was landing-styled: 46px marketing headlines inside a tool, a six-stop topbar junk drawer, a half-void rail, identical cards with no hierarchy, the Overview printing headroom twice, a loud black/white Simulation pill, and side summaries that scrolled away.

**Composition, not tokens:** the app's visual language is now a terminal — compact instrument headers, live position everywhere, summaries that persist, one chip of chrome. Landing is untouched and stays the poster; the app is the room.

- **Rail position card.** Nav (Instrument/Flow groups) plus a live **Position** plate — Collateral / Debt / LTV read straight from the snapshot — fills the void with state. The simulated-account foot stays.
- **Topbar declutter.** Clock deleted (dates live on the pages that need them), `Testnet 1439` unboxed to plain mono, leaving RatePill + segmented Day/Night + badge. Sources still flips rail/topbar per breakpoint.
- **Compact page heads.** Titles 46px → 30px/600, tighter rules; the lede carries the consequence. Above-the-fold now shows the first form or stat, not a hero.
- **Sticky summaries.** Basin/Borrow/Wellspring/Confluence/Overview right columns stick under the topbar so vessel, wallet, buffer and notes persist while the main column scrolls.
- **Overview dedupe.** Headroom said twice (stat + bar-panel); the stat stays on Overview, the bar stays on Borrow where headroom is the decision. Overview is now stats → curve → next action, in one screen.
- **Quiet Simulation chip.** Card ground, 1px border, ink text (hot state still heat-filled); no theme inversion.

## V11 addendum (2026-11-09): polish — states, gauge, press feel, lockup

Whole-surface audit (88 captures: landing + all six app screens × 4 widths × 2 themes, plus pending/receipt/drawer/error states; OpenDesign craft + Emil engineering review). Sharpened, not repainted:

| Before | After | Why |
|---|---|---|
| Over-balance input computed fantasy numbers, no error, dead submit | Per-field errors naming cause + recovery (deposit/withdraw/mint/redeem), consequence turns danger under error | State coverage: a blocked action must name itself; consequence green must never lie |
| Vessel gauge top read “100” beside 199.55 | `100%` gauge | A depth gauge reads as %, never a stray count |
| Sim-drawer selected outcome in bare black; Activity filter likewise | Cobalt selected state (`.segmented__item.is-active`) | One selection language everywhere |
| Rail `LTV 45.10% of 50.00% max` wrapped to two lines | `45.1% of 50% max`, one line | Rail is a scanline, not a paragraph |
| Crumb `QUENCH / BASIN` uppercase mono | Title case `Quench / Basin` | The logotype is lowercase; chrome must not shout over it |
| Button press = `translateY(1px)` | `scale(0.98)` | Press feedback like a physical control (Emil); no `transition: all`, durations unchanged |
| Wordmark 22px, gap .55rem, 1.125rem | 24px, gap .5rem, 1.25rem/700 | Mark and type meet at matched optical x-height; mark, type and favicon are the same geometry |

## V12 addendum (2026-11-10): compaction rules

- One row beats three stacked rows: after-values are a 3-column strip, not a stack of rows. Every figure survives; only the frame shrinks.
- The primary action sits on the input line when it fits (`Repay`), and goes full-width when it does not (≤480px). A button is never square: inline actions are ≥96px wide.
- Secondary actions share a footer row (`Swap qINJ` | `Self-liquidate`); the danger action is available, not the loudest thing on the page.
- No decorative indices: `Loans`, not `Loans / 01`. A number is printed only when it counts something real.
- Arrows mean navigation. Transaction buttons are plain; `↗` is reserved for real external links (landing, sources).
- Swap output is accented only when it has a value; at rest it is a plain field. Copy is buffer-aware (`Buffer covers this redemption`) instead of always promising 7 days.

## V13 addendum (2026-11-10): every task gets a door

- **Withdraw is a tab, not a footnote.** A first-class task does not live as a row under another screen's card. The rail/bottom nav is `Dashboard / Loans / Positions / Withdraw / Swap`; the route is `/app/withdraw` and `/app/basin` redirects there. The Positions footer keeps only `Swap qINJ | Self-liquidate`.
- **Empty states still carry the next step.** `Nothing to withdraw` names the state and links to Loans; it does not disable into a dead end. The withdraw CTA is primary cobalt — the task is the point of the page, not an alternative.
- **Nav is the source of truth for names.** If a screen is in the nav, it has a route, a heading, a crumb, and a matching page title. No hidden fifth destination reachable only from a card.
- **Small labels need word spacing.** `Swap qINJ` at 12px read as one token; `word-spacing: 0.14em` on the Positions footer actions restores two words without changing the type size.

## V14 addendum (2026-11-10): plain language, quiet danger

**The rule:** the protocol's internal names — `Basin`, `Wellspring`, `Confluence`, `harvest` — are
engineering vocabulary, not user vocabulary. A user meets *collateral*, *the protocol*, *the swap
buffer* and *auto-repay*. The names stay in the codebase (component files, engine functions, metric
keys); they never reach the screen.

| Before | After | Where |
|---|---|---|
| "Deposit a yield-bearing INJ LST into the Basin." | "Deposit stINJ as collateral." | film VO + captions, landing loop |
| "Wellspring routes the staking yield to the debt." | "Your staking yield pays the debt automatically." | film VO + captions, `POSITIONS · AUTO-REPAY` |
| "Redeem qINJ for LST units." | "Swap qINJ for stINJ." | film VO + captions |
| "Harvest" button | "Repay with yield" | Positions, Overview |
| "Mint fee" / "Redeem fee" | "Borrow fee" / "Swap fee" | landing facts, sources drawer |
| "The Basin is empty" | "No collateral yet" | Positions empty state |
| "Confluence buffer drained" | "Swap buffer drained" | activity feed |
| "qINJ minted" / "qINJ redeemed" | "qINJ borrowed" / "qINJ swapped" | activity feed |
| "qINJ burned against the debt" | "qINJ applied to the debt" | activity feed |

Token names (`stINJ`, `qINJ`) stay — they are the instruments themselves, and the app needs a
symbol to be precise.

**The danger action is quiet.** `Self-liquidate` was a solid burnt-orange block sitting next to a
neutral secondary — the loudest object on a card whose real subject is a healthy position. A danger
button should be available, not alarming. It now uses a heat-tinted surface (`--heat-soft` fill,
`--danger-line` hairline, `--heat-ink` label) and only turns to a solid danger fill on hover. Same
treatment in day and night.

**The film is one system.** The trust scene was a white panel pasted onto a dark film — it read as a
cropped screenshot rather than a designed frame. It is now a dark instrument panel (`#0E131C`, cobalt
top rule, hairline rows, mono values) with the headline on the left. The end card is full-bleed
cobalt with the mark and wordmark. Every cut is a branded wipe: a dark panel with cobalt leading and
trailing edges covers the cut and slides away, replacing the crossfade that double-exposed panels.
