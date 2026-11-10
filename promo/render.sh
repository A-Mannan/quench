#!/usr/bin/env bash
# One-command rebuild (40 s cut): capture -> score -> VO mix -> render -> mux -> captions -> QA.
# Prerequisites: Node 22+, Python3 (numpy, Pillow), ffmpeg/ffprobe, the cached
# HyperFrames 0.8.150 binary, and web/ built. Starts the web preview if needed.
# VO is the pre-generated ElevenLabs lines in promo/audio/vo/ (regenerate with vo/generate.py).
set -euo pipefail
cd "$(dirname "$0")/.."
HF=${HF_BIN:-$HOME/.npm/_npx/702923228c2ce1e6/node_modules/.bin/hyperframes}

# 1. Web preview for capture
if ! curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:4173/ | grep -q 200; then
  (cd web && nohup pnpm preview --port 4173 >/tmp/opencode/web-preview.log 2>&1 &)
  sleep 3
fi

# 2. Deterministic captures + engine facts
node promo/capture.mjs

# 3. Original score (48 kHz stereo) + VO mix (envelope-ducked) + loudness
python3 promo/audio/score.py
python3 promo/audio/mix.py
ffmpeg -y -v error -i promo/audio/mix.wav \
  -af "loudnorm=I=-15:TP=-1.5:LRA=11" -c:a pcm_s16le promo/audio/mix-final.wav

# 4. Timeline gate (video-director, MIT)
python3 /tmp/opencode/vet/repos/check_timeline.py promo/timeline.json

# 5. Render the 40 s film (vertical cut dropped by user, 2026-11-09)
"$HF" lint promo
"$HF" render promo -f 30 -q delivery -o promo/renders/quench-16x9.mp4

# 6. Mux the mix
ffmpeg -y -v error -i promo/renders/quench-16x9.mp4 -i promo/audio/mix-final.wav \
  -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest promo/renders/quench-16x9-final.mp4

# 7. Captions from the same cue table as the composition
python3 - <<'PY'
import json
d = json.load(open("promo/timeline.json"))
def ts(s):
    ms = int(round(s * 1000)); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); sec, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{sec:02d},{ms:03d}"
with open("promo/captions.srt", "w") as f:
    for i, c in enumerate(d["captions"], 1):
        f.write(f"{i}\n{ts(c['from'])} --> {ts(c['to'])}\n{c['text']}\n\n")
PY

# 8. Measured QA + contact sheets
python3 promo/tools/qa.py promo/renders/quench-16x9-final.mp4 --out docs/promo/qa

echo "Done: promo/renders/quench-16x9-final.mp4"
