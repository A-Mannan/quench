#!/usr/bin/env python3
"""Generate the promo voiceover with ElevenLabs (male narrator).

The key is read from ELEVENLABS_API_KEY and is never written to disk.
Output: promo/audio/vo/line1.wav ... line8.wav (24 kHz mono 16-bit), the
same shape mix.py expects.

Usage:
  ELEVENLABS_API_KEY=... python3 promo/audio/vo/generate.py
  ELEVENLABS_API_KEY=... python3 promo/audio/vo/generate.py 3 6
"""
from __future__ import annotations

import json
import os
import subprocess
import sys
import tempfile
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent
VOICE_ID = os.environ.get("ELEVENLABS_VOICE_ID", "onwK4e9ZLuTAKqWW03F9")  # Daniel
MODEL = os.environ.get("ELEVENLABS_MODEL", "eleven_multilingual_v2")
API = "https://api.elevenlabs.io/v1/text-to-speech"

SPEED = {6: 1.12}

LINES = {
    1: "Deposit stINJ as collateral.",
    2: "Borrow up to half its value in qINJ.",
    3: "Your staking yield pays the debt automatically.",
    4: "Ninety qINJ falls to zero.",
    5: "At zero debt, withdraw the collateral.",
    6: "Swap on a DEX, or redeem from us in about 7 days.",
    7: "Every number has a source.",
    8: "Quench. Your yield pays the loan.",
}


def synth(text: str, key: str, speed: float = 1.0) -> bytes:
    body = json.dumps(
        {
            "text": text,
            "model_id": MODEL,
            "voice_settings": {
                "stability": 0.42,
                "similarity_boost": 0.8,
                "style": 0.12,
                "use_speaker_boost": True,
                "speed": speed,
            },
        }
    ).encode()
    req = urllib.request.Request(
        f"{API}/{VOICE_ID}?output_format=mp3_44100_128",
        data=body,
        headers={
            "xi-api-key": key,
            "Content-Type": "application/json",
            "Accept": "audio/mpeg",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=120) as res:
        return res.read()


def convert(mp3: bytes, dest: Path) -> None:
    with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as f:
        f.write(mp3)
        tmp = f.name
    try:
        subprocess.run(
            [
                "ffmpeg", "-y", "-v", "error", "-i", tmp,
                "-ar", "24000", "-ac", "1", "-c:a", "pcm_s16le", str(dest),
            ],
            check=True,
        )
    finally:
        os.unlink(tmp)


def main() -> None:
    key = os.environ.get("ELEVENLABS_API_KEY")
    if not key:
        raise SystemExit("ELEVENLABS_API_KEY is not set")
    wanted = [int(a) for a in sys.argv[1:]] or sorted(LINES)
    for n in wanted:
        text = LINES[n]
        dest = ROOT / f"line{n}.wav"
        convert(synth(text, key, SPEED.get(n, 1.0)), dest)
        print(f"line{n}: {text} -> {dest.name}")


if __name__ == "__main__":
    main()
