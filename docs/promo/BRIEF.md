# Promo brief — Quench

## One-sentence message

Deposit stINJ as collateral, borrow qINJ against it, and let the staking yield pay the debt down to
zero — simulated, testnet only.

## Audience

Injective ecosystem builders and reviewers who want to see the loop in 60 seconds without reading the simulator code. Secondary: anyone landing from a social post with sound off.

## Treatment

Look: the product's own v9 blue system. Night lab `#090B0F`/`#151A24` for the film, dark instrument
panels (`#0E131C`) with cobalt `#2E5BFF` rules for the trust chapter. Hairline rules, cobalt accent
reserved for the live numbers, Schibsted Grotesk + JetBrains Mono. The app UI is the protagonist;
the camera pushes into real captures, never redraws them. Borrowed grammar from lemo-opuscar
*Dark Tech Keynote* (one accent, hairline grid, snap-grid motion) read as direction only — no code or
footage copied.

Continuity: one position throughout (deposit → borrow → auto-repay → withdraw) and one labelled
second run for the swap, because redeeming 10 qINJ leaves only 80 to repay and zero-debt would be
unreachable in the same session.

Language: **plain, no protocol jargon.** The film says *collateral vault*, *swap buffer* and
*auto-repay* — never `Basin`, `Wellspring` or `Confluence`. Those names stay in the codebase; users
never meet them. Same rule as the app chrome.

Music: original synthesized stereo score at 120 BPM (2 s per bar). No third-party track.
Voiceover: ElevenLabs male voice, mixed under the score.

Disclosure: **removed from the film at user request, 2026-11-10.** The top-bar
"Simulated demo · contracts not deployed" strip and the end-card disclosure line are gone, as is
"Assumptions, not promises." The demo status still lives in the app UI itself (the `Simulated`
badge in the header), where it is honest and does not cost the film a frame.

## Format

- 16:9, 1920×1080, 30 fps, H.264, **40 s** (tightened from 60 s, 2026-11-09 — the cut keeps only the beats the voice carries).
- 9:16 cut: **dropped by user** — 16:9 only is delivered.
- Voiceover: **ElevenLabs** `eleven_multilingual_v2`, voice `Daniel — Steady Broadcaster` (male),
  8 lines generated offline into `promo/audio/vo/` by `promo/audio/vo/generate.py`. The key is read
  from `ELEVENLABS_API_KEY` and never written to the repo. The score is ducked ~−8 dB under speech by
  an envelope follower with 40 ms lookahead (`promo/audio/mix.py`), then the sum is normalised to
  −15 LUFS / −1.5 dBTP.

## Timecoded shot list — 16:9 (40 s)

| t (s) | Chapter | Shown | Learned | Audio cue |
|---|---|---|---|---|
| 0–3 | Hook | Debt counter falls 90 → 74.44; title "quench" | The product and the promise | Pulse + first note |
| 3–8 | Loans · Add | Loans card, `200` + `90` typed, after-strip 199.55 stINJ / 90.00 qINJ | Add + borrow in one transaction | VO1 + tick |
| 8–13 | Loans · Borrow | Loans card pushed in, 90.00 qINJ, LTV 45.10% | The borrow | VO2 + confirm |
| 13–19 | Positions · Auto-repay | Position, counter 74.44 → 0.00 | The yield pays the debt | VO3 + rising arpeggio |
| 19–21 | Zero (hero) | Counter hits 0.00; "Debt is zero." | Payoff | VO4 + hit |
| 21–26 | Withdraw tab | Withdraw card, "Debt 0.00 qINJ" | Withdraw unlocks at zero | VO5 + release |
| 26–32 | Swap (separate run) | Swap card, 10 qINJ → 9.95 stINJ, "in 7 days" | Redemption is LST with a worst case | VO6 + glass tap |
| 32–36 | Sources | Dark panel: APR 7.53%, 0.50% fees, 50.00% LTV, 500 stINJ | Every number has a source | VO7, sparse |
| 36–40 | End card | Cobalt full-bleed: mark, wordmark, tagline | Your yield pays the loan | VO8 + resolve |

Hero moment: t = 21 s, the debt counter hits 0.00. Music dip 18.5–19.5 s before it (VO speaks over it).

Transitions: a **branded cobalt wipe** at every cut. A dark panel with cobalt leading and trailing
edges covers the cut, then slides away to reveal the next screen. The earlier crossfade double-exposed
the outgoing and incoming panels and was rejected.

## Shot list — 9:16 (18 s) — dropped

| t (s) | Beat | Shown | Learned |
|---|---|---|---|
| 0–3 | Hook | Title + falling debt | The loop in one line |
| 3–7 | Loans · Add | Loans card | Add 200 stINJ · borrow 90 qINJ |
| 7–11 | Loans · Borrow | Loans card, 90.00 qINJ, 45.10% | Borrow qINJ |
| 11–15 | Positions | Position, debt to zero | Yield pays it down |
| 15–18 | End | Wordmark | Your yield pays the loan |

## Caption script (burned in + `.srt`)

These are the exact sentences the voice speaks, in order.

1. "Your yield pays the loan."
2. "Deposit stINJ as collateral."
3. "Borrow up to half its value in qINJ."
4. "Your staking yield pays the debt automatically."
5. "Ninety qINJ falls to zero."
6. "At zero debt, withdraw the collateral."
7. "Swap qINJ for stINJ. Worst case, seven days."
8. "Every number has a source."

## Music direction

120 BPM, 4/4, A minor, warm and restrained — but a real arrangement, not a drone: detuned-saw pad
and sub, pulsed bass, 16th arpeggio, kick/snare/clap/hats, a two-statement lead, FM piano, riser
and one impact at the 21 s hero. Kick sidechain and convolution reverb keep it moving without
volume. No cast of thousands, no trailer brass. A single accent: cobalt numbers. The score strips
to pad + riser at 18.7–21 s and resolves on C at the end. The VO is placed on top and the music
ducks under it dynamically. Louder is not better; −15 LUFS integrated, true peak ≤ −1 dBTP.
[DECISION]
