# Asset ledger — promo film

Every font, music track, sound effect and voice used. Commercial use confirmed or the asset is excluded.

| Asset | Used in | Licence | Source | Commercial use |
|---|---|---|---|---|
| Schibsted Grotesk variable (Latin) | All on-screen type | SIL Open Font License 1.1 | `@fontsource-variable/schibsted-grotesk` 5.3.0 in `web/node_modules`, copied to `promo/assets/fonts/` | Confirmed — OFL permits commercial use |
| JetBrains Mono 400/500/600/700 | Data, numbers, labels | SIL Open Font License 1.1 | `@fontsource/jetbrains-mono` 5.3.0 in `web/node_modules` | Confirmed — OFL permits commercial use |
| Score + SFX (60 s + 18 s) | Both cuts | Original work, created for this film | Synthesized locally by `promo/audio/score.py` (Python 3.12, numpy 2.5.3) | Confirmed — no third-party sample, no generative model |
| App screenshots | All product frames | Project's own UI | Captured from `web/` with Playwright 1.64.1 (`promo/capture.mjs`) | Confirmed — first-party |
| Voiceover (8 lines, `promo/audio/vo/lineN.wav`) | Local Kokoro-82M `af_heart`, generated offline via HyperFrames `tts`; no API key | Apache-2.0 model (Kokoro, hexgrad); generated audio is original | HyperFrames `tts` (ons/device, no account) | Confirmed — local generation, no key, no third-party voice |

## Excluded after review

- video-shotcraft bundled BGM (Mixkit): not used. Its per-file licences would need individual clearance; an original score removes the risk.
- brag bundled music (ende.app, CC BY 4.0): not used. Attribution plus an extra licence surface for no creative gain.
- lemo-opuscar demo films (CC BY 4.0) and the six excluded voice tracks: not used; the styles were read as direction only.
- chaojifeng gallery music (commercial songs, own rights): not used.
- Freesound SFX (CC0 / CC BY): not used. All SFX are synthesized.
- HyperFrames stock/music catalogs: not resolved. Score, SFX and VO are all local (numpy synthesis + Kokoro-82M on-device).

## Fonts note

The two faces are the product's own self-hosted fonts. HyperFrames requires local `@font-face` files for any named family, so the `.woff2` files are vendored into `promo/assets/fonts/` rather than hot-linked.
