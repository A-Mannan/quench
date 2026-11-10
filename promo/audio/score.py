#!/usr/bin/env python3
"""Original synthesized score + SFX for the Quench promo film (40 s cut).

No third-party samples. Python/numpy only. Deterministic (fixed seeds).

Music: 120 BPM 4/4, 2 s per bar, piano-led, warm and restrained.
Silence 18.5-19.5 s before the hero (debt hits 0.00 at t=21).
Outputs: score-40.wav.
"""
from pathlib import Path
import numpy as np

SR = 48000
BPM = 120
BEAT = 60.0 / BPM  # 0.5 s
BAR = 4 * BEAT     # 2 s

NOTE = {"C3": 130.81, "D3": 146.83, "E3": 164.81, "F3": 174.61,
        "G3": 196.00, "A3": 220.00, "B3": 246.94, "C4": 261.63,
        "D4": 293.66, "E4": 329.63, "F4": 349.23, "G4": 392.00,
        "A4": 440.00, "B4": 493.88, "C5": 523.25}

rng = np.random.default_rng(20261109)


def pluck(freq: float, dur: float, gain: float) -> np.ndarray:
    n = int(dur * SR)
    t = np.arange(n) / SR
    env = np.exp(-t * 6.0)
    sig = np.sin(2 * np.pi * freq * t) + 0.35 * np.sin(2 * np.pi * freq * 2 * t) + 0.12 * np.sin(2 * np.pi * freq * 3 * t)
    return (gain * env * sig).astype(np.float64)


def pad(freqs, dur, gain):
    n = int(dur * SR)
    t = np.arange(n) / SR
    sig = np.zeros(n)
    for f in freqs:
        sig += np.sin(2 * np.pi * f * t)
    env = np.clip(np.linspace(0, 1, n) * 4, 0, 1) * np.clip(np.linspace(1, 0, n) * 4, 0, 1)
    return (gain * env * sig / len(freqs)).astype(np.float64)


def pulse(freq=65.41, dur=0.22, gain=0.5):
    n = int(dur * SR)
    t = np.arange(n) / SR
    return (gain * np.exp(-t * 14) * np.sin(2 * np.pi * freq * t)).astype(np.float64)


def tick(freq=1560.0, dur=0.06, gain=0.25):
    n = int(dur * SR)
    t = np.arange(n) / SR
    return (gain * np.exp(-t * 60) * np.sin(2 * np.pi * freq * t)).astype(np.float64)


def place(buf, sig, at):
    i = int(at * SR)
    j = min(len(buf), i + len(sig))
    if i < len(buf):
        buf[i:j] += sig[: j - i]


def compose(duration, motif):
    buf = np.zeros(int(duration * SR), dtype=np.float64)
    chords = [["C3", "E3", "G3"], ["A3", "C4", "E4"], ["F3", "A3", "C4"], ["G3", "B3", "D4"]]
    for bar in range(int(duration // BAR)):
        chord = chords[bar % 4]
        place(buf, pad([NOTE[n] for n in chord], BAR, 0.18), bar * BAR)
        place(buf, pulse(), bar * BAR)
        place(buf, pulse(gain=0.35), bar * BAR + 2 * BEAT)
    for (at, name, gain) in motif:
        if at < duration:
            place(buf, pluck(NOTE[name], 0.9, gain), at)
            # dotted-eighth echo (0.375 s at 120 BPM), two soft repeats
            place(buf, pluck(NOTE[name], 0.7, gain * 0.18), at + 0.375)
            place(buf, pluck(NOTE[name], 0.6, gain * 0.08), at + 0.75)
    # extra soft bass on beat 4
    roots = ["C3", "A3", "F3", "G3"]
    for bar in range(int(duration // BAR)):
        place(buf, pulse(freq=NOTE[roots[bar % 4]], dur=0.3, gain=0.18), bar * BAR + 3 * BEAT)
    for at in [0.0, 3.5, 8.5, 14.0, 20.0, 27.0, 33.0]:
        if at < duration:
            place(buf, tick(), at)
    # hero hit at 21
    place(buf, pulse(freq=130.81, dur=0.5, gain=0.7), 21.0)
    place(buf, pluck(NOTE["C4"], 1.2, 0.5), 21.0)
    # planned silence before the hero
    buf[int(18.5 * SR): int(19.5 * SR)] = 0.0
    fade = int(0.5 * SR)
    buf[:fade] *= np.linspace(0, 1, fade)
    buf[-fade:] *= np.linspace(1, 0, fade)
    peak = np.max(np.abs(buf))
    if peak > 1e-9:
        buf = buf / peak * 0.70
    return buf


motif = [
    (0.0, "E4", 0.5), (0.5, "G4", 0.4), (1.0, "C5", 0.45), (1.5, "B4", 0.4), (2.0, "A4", 0.4),
    (3.5, "G4", 0.45), (4.5, "E4", 0.4), (5.5, "C4", 0.4), (6.5, "D4", 0.4),
    (8.5, "E4", 0.45), (9.5, "G4", 0.4), (10.5, "C5", 0.45), (11.5, "B4", 0.4),
    (14.0, "C5", 0.4), (15.0, "B4", 0.35), (16.0, "A4", 0.35), (17.0, "G4", 0.4), (18.0, "E4", 0.3),
    (20.0, "C4", 0.4), (21.5, "E4", 0.4), (23.0, "G4", 0.4), (24.5, "C5", 0.45),
    (27.0, "E4", 0.4), (28.5, "G4", 0.35), (30.0, "A4", 0.35),
    (33.0, "C4", 0.35), (34.5, "E4", 0.35), (36.5, "E4", 0.45), (37.5, "C5", 0.5), (38.5, "G4", 0.4),
]


def write_wav(buf, path):
    import wave, struct
    with wave.open(str(path), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        frames = np.empty((len(buf), 2))
        frames[:, 0] = buf
        frames[:, 1] = buf
        w.writeframes(b"".join(struct.pack("<h", int(np.clip(s, -1, 1) * 32767)) for s in frames.reshape(-1)))
    print("wrote", path, len(buf) / SR, "s")


if __name__ == "__main__":
    here = Path(__file__).resolve().parent
    write_wav(compose(40, motif), here / "score-40.wav")
