# Case study — Quench

**Concept:** The Cooling Ledger. A loan is a pressurised system; staking yield is coolant. The interface is a quiet control room: one instrument (the debt curve), measured readings, and exits that never freeze. Every number is a reading; every action is a valve; every risk is a physical consequence. The design earns trust by being boring in the right places and exact everywhere.

**Audience:** investors (90-second pitch), DeFi-literate users, and newcomers to self-repaying loans — one app, progressive disclosure, no audience modes.

## Five decisions, each with the rejected alternative

1. **Debt curve as the hero, not a card grid.** The curve *is* the argument that a self-repaying loan works. A grid of identical stat cards (the DeFi default) makes the curve secondary. Rejected: stat cards + chart library; chosen: a purpose-built SVG pressure curve with headroom band and falling debt line, reused on the landing and the app Overview.

2. **The dealt black-gold system over our own teal (V3/V4).** V1/V2 used a custom mineral-teal system (Anybody + teal). The taste-skill deal for a software fintech page is `warm-black-gold` + Schibsted 400 + JetBrains Mono — a studio ground where gold is the *sole* accent and 400-weight dimensions do the shouting. V4 adopts it verbatim and drops our teal entirely (including the teal vessel fill), because the deal's discipline is stricter than ours was. Rejected: another bespoke palette; chosen: the dealt system, adapted only where our no-third-party rule forces it (self-hosted fonts).

3. **Type as the identity, not decoration.** Anybody at 620–640 weight, 102–108 width, tight leading — an instrument label, not a nameplate shout. V1's 780–830 weight at 12rem was unreadable. Rejected: Inter/Geist/Satoshi; chosen: Anybody + Public Sans + IBM Plex Mono, sentence case, no tracked eyebrows above headings.

4. **Coolant teal as the *sole* accent; semantic colour does the rest.** One accent (teal) for coolant/primary; functional rust for debt, green for repaid, amber for stale. The accent never appears more than twice per screen. Rejected: multi-accent dashboards and gradient washes; chosen: a single accent disciplined by the anti-slop rules (OpenDesign).

5. **Consequences before the button, always.** Every primary action shows a "What changes" block (fee, debt after, headroom after) so a newcomer can read the irreversible consequence before the irreversible click. Rejected: a bare mint button; chosen: consequence rows + disabled-until-valid + plain-language helpers. This is the investor and the newcomer sharing one surface.

## Three details most people would miss

1. **The mint fee leaves *stINJ collateral*, not qINJ.** The Borrow screen's consequence block shows the fee in stINJ and the headroom *after* the fee. It is the only place in the UI where a fee visibly reduces collateral while debt rises by exactly the minted amount — the supply/debt coherence the engine enforces.

2. **Redemption never reports INJ.** The Confluence receipt, the queue ledger, and the landing Exits section all say "You receive stINJ, not INJ" and "Worst case is 7 days, never 21-day unbonding." The landing pairs "Protocol unbonding 21 days" (struck through) against "Confluence worst case ≤ 7 days, illustrative" — the 21-day dependency is impossible to miss.

3. **Wellspring's limit is visible, not hidden.** When the wallet holds no qINJ, the Wellspring hero shows "No qINJ in this wallet" and the pending yield stays unharvested. The UI reports a partial/zero harvest instead of pretending the loan is self-repaying without the user's qINJ. It turns the demo's weakest simplification into an honesty signal.

## Screenshots (v2)

- Landing hero: `web/screenshots/v2-landing-1440.png` (also in `/tmp/opencode/quench-shots/`).
- Landing full: `web/screenshots/v2-landing-full.png`.
- Basin: `web/screenshots/v2-basin.png`.
- Borrow: `web/screenshots/v2-borrow.png`.

## What was *not* built (deliberately)

Frontend scope was amended for this change only; `build-quench-mvp` stays paused. No wallet/chain library, no backend, no ABIs, no addresses, no TVL/users/audits/partners. Alchemix was used for mental-model comparison only — no code, visuals or copy from Alchemix is in this repository.
