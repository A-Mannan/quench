# SPEC — Quench promo (16:9)

GOAL: A stranger leaves able to say "deposit stINJ, mint qINJ, yield pays the debt to zero, withdraw" and that it is a simulation.
OUTPUT: HyperFrames, 1920×1080, 30 fps, 40 s (1200 frames); 9:16 cut dropped by user.
TIME: 120 BPM, 4/4 → 2 s per bar, 0.5 s per beat; 30 bars. Hero on beat 56 (t=28 s, the zero). Planned silence 26.5–27.5 s before the hero.
LOOK: ground night lab `#090B0F` with a hairline grid (white 3%, every 4th line 6%, 48 px module) and a radial lift at upper centre; trust chapter ground day paper `#EDF0F6`. Ink `#E8ECF4`; one accent cobalt `#2E5BFF` reserved for the live numbers and the disclosure's marker. Display face Schibsted Grotesk 500, hook 84 px, titles 84 px, tracking −2%; data face JetBrains Mono 500, numbers 48 px, labels 24 px. Medium: the product's own UI at 2×; letter-spacing wide small-caps labels. Light: one cool glow, single-digit opacity, off-centre; no grain.
OBJECTS: the Basin deposit card, the Loan card, the Positions card, the Confluence swap card, the debt counter (the one quantity that changes, 90.00 → 74.44 → 0.00). All are captured PNGs in `promo/capture/`.
MOTION: enter strong ease-out (`power4.out`) 0.18 s; moves `power2.inOut` 0.4–0.6 s with overflow hidden; no overshoot decay on type; camera pushes 1.00→1.08 over a chapter; one hero move per shot (the counter falling). Captions enter 0.16 s rise+fade, hold ≥1.8 s.
SHOTS: see `docs/promo/BRIEF.md` for the eight chapters; each is fully specified in `timeline.json` (cuts, texts, captions, terms). Hero: t=28 on beat 56. End card: mark + wordmark land 57–60 s with disclosure held.
BANNED: a black void with small floating elements; glow/bloom/neon/particles; purple-blue gradients; glass cards; cream paper with serif/italic/mono-label décor; everything centred and fading in; type moving while read; corner HUD chips; three-card rows; title over a dimmed screenshot; logo docked in a corner; dots/bullet rows as nav; dots as evidence.
QA: frames 0,1,2,3 (hook), 6,12,20,28,30,38,46,52,57,59; contact sheets at every cut; 360 px phone sheet; text size/contrast measured; −15 LUFS, true peak ≤ −1 dBTP.
