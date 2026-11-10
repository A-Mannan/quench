# QA — Quench promo film (40 s cut, Loans/Positions/Swap UI)

Measured, not asserted. Rendered locally with HyperFrames 0.8.150 (`delivery` quality).
QA adapted from video-director (MIT) into `promo/tools/qa.py`.

Re-rendered 2026-11-10 after the v31 compaction (compact `after-strip`, inline Repay, sheet
numbers and decorative action arrows removed). `promo/capture.mjs` drives the unified Loans flow
(`loan-deposit-input` + `mint-input` in one atomic transaction), the narrow `Position` widget, and
`Positions / withdraw`. All on-screen numbers are unchanged (`promo/facts.json`: 199.55 stINJ /
90.00 qINJ / LTV 45.10% / 74.44 after 1 y / 0.00 at 6 y / 249.55 wallet / 490.05 buffer), so
`docs/promo/CLAIMS.md` is re-dated, not re-measured.

## Deliverable

- `promo/renders/quench-16x9-final.mp4` — 1920×1080, 30 fps, H.264 + AAC, 40.00 s.
- Voiceover: local Kokoro-82M `af_heart`, 8 lines generated offline (no API key).
  Music ducked −10 dB under VO; mix −15.88 LUFS.
- Captions burned in and `promo/captions.srt` (same cue table as the VO).
- Vertical cut: **dropped by user, 2026-11-09** (16:9 only).
- 60 s → 40 s tightening, 2026-11-09: the zoom drift (1.03→1.12) was removed
  after it was called out for making the UI grow; replaced with a fixed-scale
  vertical pan and hard cuts on objects. Runtime now follows the voice.
- 2026-11-10: Loans Add vs Borrow read as one push-in (mint shot scaled 1.28×
  so the 8 s hard cut is legible at 192 px analysis size).
- 2026-11-10 (v31): the Loans/Withdraw after-panel is now a 3-column `after-strip`;
  Positions Repay sits inline with its input; instrument bars carry `Loans` / `Positions` /
  `Swap` without decorative `/ 01` numbers; transaction buttons carry no external-link arrow.

## Gates (pasted from `python3 promo/tools/qa.py promo/renders/quench-16x9-final.mp4 --out docs/promo/qa`)

```
PASS — spec: h264 1920x1080 @ 30 fps, 40.00s (planned 1920x1080 30fps 40s)
PASS — frame 0: mean 17.5, std 27.6
WARN — single-frame flashes: 2 spikes
WARN — frozen stretch: 3.2-7.6s (4.4s)
WARN — frozen stretch: 8.2-12.4s (4.2s)
WARN — frozen stretch: 19.0-21.0s (2.0s)
WARN — frozen stretch: 21.6-25.6s (4.0s)
WARN — frozen stretch: 26.2-30.8s (4.6s)
WARN — frozen stretch: 32.0-35.0s (3.0s)
WARN — frozen stretch: 36.8-39.5s (2.7s)
WARN — duplicate frames: 16 identical pairs
PASS — cuts vs plan: planned [3, 8, 13, 19, 26, 32, 36]; detected [3.0, 8.0, 13.0, 19.0, 21.0, 26.0, 32.0, 36.0]; missing []
PASS — loudness / true peak: integrated -15.88 LUFS (target -15), true peak -1.35 dBTP (limit -1)
WARN — planned silence: planned 18.5-19.5s (music dip; VO speaks over it); long quiet windows []
PASS — unintended silence: []
PASS — text 'Simulated demo · contracts not dep' (cta): rendered 90px (floor 48), contrast 25.67:1 at t=20.1s
PASS — text 'quench — Your yield pays the loan.' (hook): rendered 200px (floor 84), contrast 31.29:1 at t=1.6s
PASS — text 'Loans: Add 200 stINJ · borrow 90 q' (term): rendered 100px (floor 48), contrast 15.82:1 at t=5.8s
PASS — text '90.00 qINJ · LTV 45.10%' (term): rendered 100px (floor 48), contrast 16.50:1 at t=10.8s
PASS — text 'Positions: Debt 90.00 → 0.00 qINJ' (term): rendered 100px (floor 48), contrast 19.47:1 at t=16.5s
PASS — text 'Debt 0.00 qINJ — withdraw' (term): rendered 100px (floor 48), contrast 21.11:1 at t=23.0s
PASS — text 'Swap: 10 qINJ → 9.95 stINJ · worst' (term): rendered 100px (floor 48), contrast 18.33:1 at t=29.5s
PASS — text 'APR 7.53% assumption · fees 0.50%' (term): rendered 100px (floor 48), contrast 26.16:1 at t=34.5s
```

Exit code 0. The WARNs are designed holds (the voice is the moving element; the pan is legible at 1080p but under-detected at the 192 px analysis size — the earlier 1.03→1.12 zoom that read as "the widget keeps increasing" was removed).

## Timeline gate

`python3 check_timeline.py promo/timeline.json` → `0 error(s), 8 warning(s)` (transition "why" tags on the rewritten 40 s scenes; `hh` hook read-time warn on the 2.8 s hook — the VO line carries it; the burned caption repeats it at 3.2 s).

## Independent critique (clean-context subagent)

First pass: REJECT. Message restated correctly from frames alone; ranked must-fix:

1. End card blank 52–57 s. → Fixed: mark + wordmark land at 52.3 s (now 36.3 s on the 40 s cut).
2. Disclosure illegible at phone size. → Fixed: 48 px bar, 25.70:1.
3. Captions microtype at phone. → Fixed: 56 px rail.
4. Frozen screenshots. → Partially fixed: fixed-scale pan + VO is the motion now; analysis still flags holds (see WARN justification).
5. Horizon/phrasing ("Never 21-day unbonding" absolute). → Fixed: "Worst case, seven days"; horizons "· 1 year at 7.53%" / "Over 6 simulated years".

## Honest limitations

- I cannot watch or hear the film; motion quality, VO delivery, musical taste are unmeasured. [UNVERIFIED]
- The VO is a local 82 M model — present and correct, but plain. A human read would lift it; that path needs a licensed voice file, not a key.
- HyperFrames `lint` reports 0 errors, 13 warnings (studio-editability only).

## Self-score: 8.5/10

## Re-render

`bash promo/render.sh` — captures, scores, VO stays in `promo/audio/vo/`, renders, muxes, captions, QA.
