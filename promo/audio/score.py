#!/usr/bin/env python3
"""Original synthesized score + SFX for the Quench promo film (40 s cut).

No third-party samples, no generative model. Python/numpy only, deterministic
(fixed seed). Output: score-40.wav (48 kHz stereo, 40.00 s).

Arrangement (120 BPM, A minor, 2 s bars):
  0-4    intro pad, air, sparse piano
  4-8    pulse bass + arp, soft kick
  8-13   four-on-the-floor, hats, arp opens
  13-19  full groove + lead motif
  19-21  strip, riser, reverse swell
  21     impact (debt hits 0.00)
  21-32  warm resolve, groove returns
  32-36  reduce to piano + pad
  36-40  closing C, fade

The mix step (promo/audio/mix.py) ducks this bed under the voiceover.
"""
from pathlib import Path
import wave
import numpy as np

SR = 48000
DUR = 40.0
N = int(SR * DUR)
BPM = 120.0
BEAT = 60.0 / BPM
BAR = 4 * BEAT

rng = np.random.default_rng(20261110)

# ---------------------------------------------------------------- helpers


def hz(note: int) -> float:
    """MIDI note number -> Hz."""
    return 440.0 * 2.0 ** ((note - 69) / 12.0)


def lowpass(x: np.ndarray, cutoff: float, order: int = 2) -> np.ndarray:
    n = len(x)
    if n == 0:
        return x
    spec = np.fft.rfft(x)
    f = np.fft.rfftfreq(n, 1.0 / SR)
    h = 1.0 / np.sqrt(1.0 + (f / max(cutoff, 1.0)) ** (2 * order))
    return np.fft.irfft(spec * h, n)


def highpass(x: np.ndarray, cutoff: float, order: int = 2) -> np.ndarray:
    n = len(x)
    if n == 0:
        return x
    spec = np.fft.rfft(x)
    f = np.fft.rfftfreq(n, 1.0 / SR)
    h = 1.0 / np.sqrt(1.0 + (max(cutoff, 1.0) / np.maximum(f, 1e-9)) ** (2 * order))
    return np.fft.irfft(spec * h, n)


def bandpass(x: np.ndarray, lo: float, hi: float, order: int = 2) -> np.ndarray:
    return highpass(lowpass(x, hi, order), lo, order)


def stereo_pad(notes, dur: float, cutoff: float, gain: float = 0.14):
    """Detuned saw pad, wide, with a sub root. Returns (L, R)."""
    n = int((dur + 0.7) * SR)
    t = np.arange(n) / SR
    env = np.ones(n)
    a = int(0.55 * SR)
    r = int(0.9 * SR)
    env[:a] = np.linspace(0.0, 1.0, a) ** 1.6
    env[-r:] *= np.linspace(1.0, 0.0, r) ** 1.3
    left = np.zeros(n)
    right = np.zeros(n)
    for note in notes:
        f = hz(note)
        for detune, pan in ((-0.005, -0.75), (0.0, 0.0), (0.005, 0.75)):
            phase = rng.random()
            osc = 2.0 * ((f * (1.0 + detune) * t + phase) % 1.0) - 1.0
            osc = 0.62 * osc + 0.38 * np.sin(2.0 * np.pi * f * (1.0 + detune) * t)
            gl = 0.5 - 0.5 * pan
            gr = 0.5 + 0.5 * pan
            left += osc * gl
            right += osc * gr
    sub = 0.55 * np.sin(2.0 * np.pi * hz(notes[0]) * t)
    left += sub
    right += sub
    left = lowpass(left, cutoff)
    right = lowpass(right, cutoff)
    lfo = 1.0 + 0.05 * np.sin(2.0 * np.pi * 0.11 * t + 0.6)
    scale = gain / max(1, len(notes))
    return left * env * lfo * scale, right * env * lfo * scale


def pluck(f: float, dur: float = 0.9, gain: float = 0.28, bright: float = 1.0) -> np.ndarray:
    """FM-ish piano/pluck with a soft attack and long tail."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    mod = np.sin(2.0 * np.pi * f * 2.0 * t) * np.exp(-t * 4.5) * 1.35 * bright
    sig = np.sin(2.0 * np.pi * f * t + mod)
    sig += 0.28 * np.sin(2.0 * np.pi * f * 3.0 * t) * np.exp(-t * 7.0)
    env = (1.0 - np.exp(-t * 220.0)) * np.exp(-t * 3.6)
    return gain * env * sig


def bass_note(f: float, dur: float = 0.42, gain: float = 0.42) -> np.ndarray:
    n = int(dur * SR)
    t = np.arange(n) / SR
    sig = (
        np.sin(2.0 * np.pi * f * t)
        + 0.34 * np.sin(2.0 * np.pi * f * 2.0 * t)
        + 0.12 * np.sin(2.0 * np.pi * f * 3.0 * t)
    )
    sig = np.tanh(sig * 1.5)
    env = (1.0 - np.exp(-t * 90.0)) * np.exp(-t * 5.5)
    return gain * env * sig


def kick(gain: float = 0.9) -> np.ndarray:
    n = int(0.42 * SR)
    t = np.arange(n) / SR
    f = 45.0 + 85.0 * np.exp(-t / 0.028)
    phase = 2.0 * np.pi * np.cumsum(f) / SR
    body = np.sin(phase) * np.exp(-t / 0.26)
    click = highpass(rng.standard_normal(n), 2800.0) * np.exp(-t / 0.004) * 0.16
    return gain * np.tanh((body + click) * 1.2)


def snare(gain: float = 0.32) -> np.ndarray:
    n = int(0.26 * SR)
    t = np.arange(n) / SR
    noise = bandpass(rng.standard_normal(n), 1400.0, 6800.0) * np.exp(-t / 0.105)
    body = np.sin(2.0 * np.pi * 186.0 * t) * np.exp(-t / 0.07) * 0.55
    return gain * (noise + body)


def clap(gain: float = 0.16) -> np.ndarray:
    n = int(0.22 * SR)
    out = np.zeros(n)
    for offset in (0.0, 0.011, 0.023):
        i = int(offset * SR)
        m = int(0.09 * SR)
        t = np.arange(m) / SR
        burst = bandpass(rng.standard_normal(m), 900.0, 4200.0) * np.exp(-t / 0.035)
        out[i:i + m] += burst
    return gain * out


def hat(gain: float = 0.11, dur: float = 0.055) -> np.ndarray:
    n = int(dur * SR)
    t = np.arange(n) / SR
    return gain * highpass(rng.standard_normal(n), 7200.0) * np.exp(-t / 0.018)


def riser(dur: float = 2.0) -> np.ndarray:
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = 180.0 * (34.0 ** (t / dur))
    tone = np.sin(2.0 * np.pi * np.cumsum(f) / SR)
    noise = highpass(rng.standard_normal(n), 900.0)
    env = (t / dur) ** 2.4
    return 0.20 * env * (0.55 * tone + 0.45 * noise)


def impact() -> np.ndarray:
    n = int(1.7 * SR)
    t = np.arange(n) / SR
    f = 34.0 + 48.0 * np.exp(-t / 0.20)
    boom = np.sin(2.0 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.62)
    hit = lowpass(rng.standard_normal(n), 420.0) * np.exp(-t / 0.18) * 0.5
    return 0.85 * np.tanh((boom + hit) * 1.1)


def whoosh(strength: float = 0.09) -> np.ndarray:
    n = int(0.9 * SR)
    t = np.arange(n) / SR
    env = np.exp(-((t - 0.45) / 0.18) ** 2)
    noise = bandpass(rng.standard_normal(n), 420.0, 5200.0)
    return strength * env * noise


def tick(gain: float = 0.10) -> np.ndarray:
    n = int(0.07 * SR)
    t = np.arange(n) / SR
    return gain * np.sin(2.0 * np.pi * 1760.0 * t) * np.exp(-t * 70.0)


def make_ir(seconds: float = 1.5, decay: float = 4.2):
    n = int(seconds * SR)
    t = np.arange(n) / SR
    ir = rng.standard_normal((n, 2)) * np.exp(-t * decay)[:, None]
    for c in range(2):
        ir[:, c] = lowpass(ir[:, c], 5200.0)
    ir /= np.sqrt(np.sum(ir ** 2, axis=0, keepdims=True)) + 1e-9
    return ir


def reverb(x: np.ndarray, ir: np.ndarray) -> np.ndarray:
    n = len(x) + len(ir) - 1
    nfft = 1 << (n - 1).bit_length()
    out = np.fft.irfft(np.fft.rfft(x, nfft) * np.fft.rfft(ir, nfft), nfft)[: len(x)]
    return out


def delay(x: np.ndarray, step: float = 0.375, feedback: float = 0.28, mix: float = 0.22):
    """Feedback delay; returns the wet signal only."""
    out = np.zeros_like(x)
    d = int(step * SR)
    for k in range(1, 5):
        if d * k >= len(x):
            break
        out[d * k:] += x[:-d * k] * (feedback ** (k - 1)) * mix
    return out


def add(buf: np.ndarray, sig: np.ndarray, at: float, pan: float = 0.0, gain: float = 1.0):
    """Place a mono signal into a stereo pair."""
    i = int(at * SR)
    if i >= len(buf[0]):
        return
    j = min(len(buf[0]), i + len(sig))
    seg = sig[: j - i] * gain
    buf[0][i:j] += seg * (0.5 - 0.5 * pan)
    buf[1][i:j] += seg * (0.5 + 0.5 * pan)


def add_stereo(buf, left, right, at, gain=1.0):
    i = int(at * SR)
    if i >= len(buf[0]):
        return
    j = min(len(buf[0]), i + len(left))
    buf[0][i:j] += left[: j - i] * gain
    buf[1][i:j] += right[: j - i] * gain


def duck(total: int, hits, depth: float = 0.42, release: float = 0.20) -> np.ndarray:
    env = np.ones(total)
    n = int(0.42 * SR)
    tt = np.arange(n) / SR
    shape = 1.0 - depth * np.exp(-tt / release)
    a = int(0.007 * SR)
    shape[:a] = np.linspace(1.0, 1.0 - depth, a)
    for h in hits:
        i = int(h * SR)
        j = min(total, i + n)
        if i < total:
            env[i:j] = np.minimum(env[i:j], shape[: j - i])
    return env


# ---------------------------------------------------------------- material

CHORDS = {
    "Am": [45, 57, 60, 64],
    "F": [41, 53, 57, 60],
    "C": [48, 55, 60, 64],
    "G": [43, 55, 59, 62],
}

# (start, chord, pad cutoff)
PAD = [
    (0.0, "Am", 420), (2.0, "F", 500), (4.0, "C", 720), (6.0, "G", 900),
    (8.0, "Am", 1100), (10.0, "F", 1300), (12.0, "C", 1500), (14.0, "G", 1650),
    (16.0, "Am", 1550), (18.0, "F", 850),
    (21.0, "C", 1800), (23.0, "G", 1650), (25.0, "Am", 1550), (27.0, "F", 1450),
    (29.0, "C", 1350), (31.0, "G", 1250), (33.0, "Am", 1050), (35.0, "F", 900),
    (37.0, "C", 1200),
]

# Root for the bass; F1 is too low for small speakers, use F2.
BASS_ROOT = {"Am": 33, "F": 41, "C": 36, "G": 43}
FIFTH = {"Am": 40, "F": 48, "C": 43, "G": 50}  # E2, C3, G2, D3

kick_times = [t for t in np.arange(4.0, 19.0, 0.5)]
kick_times += [t for t in np.arange(21.5, 32.0, 0.5)]
soft_kicks = [t for t in np.arange(4.0, 8.0, 1.0)]

snare_times = [t for t in np.arange(12.0, 19.0, BAR) for t in (t + BEAT, t + 3 * BEAT)]
snare_times += [t for t in np.arange(22.0, 32.0, BAR) for t in (t + BEAT, t + 3 * BEAT)]

hat_times = [t for t in np.arange(12.0, 19.0, 0.25)]
hat_times += [t for t in np.arange(22.0, 34.0, 0.25)]

# Lead motif, two statements.
LEAD = [
    (13.0, 76, 0.55), (13.5, 74, 0.50), (14.0, 72, 0.55), (14.75, 71, 0.50),
    (15.5, 69, 0.55), (16.5, 72, 0.50), (17.5, 71, 0.45), (18.25, 69, 0.40),
    (26.0, 76, 0.52), (26.75, 79, 0.48), (27.5, 76, 0.50), (28.25, 74, 0.46),
    (29.0, 72, 0.50), (30.0, 74, 0.46), (31.0, 72, 0.42), (31.75, 69, 0.38),
]

PIANO = [
    (0.0, 69, 0.26), (0.75, 72, 0.22), (1.5, 76, 0.20), (2.4, 72, 0.18),
    (4.5, 76, 0.16), (6.5, 74, 0.15),
    (36.2, 72, 0.24), (37.0, 67, 0.20), (38.0, 64, 0.18), (39.0, 60, 0.16),
]

WHOOSH_AT = [3.0, 8.0, 13.0, 19.0, 26.0, 32.0, 36.0]
TICKS = [0.0, 3.5, 8.5, 14.0, 20.0, 27.0, 33.0]

# ---------------------------------------------------------------- render

pad_bus = np.zeros((2, N))
bass_bus = np.zeros((2, N))
arp_bus = np.zeros((2, N))
drum_bus = np.zeros((2, N))
lead_bus = np.zeros((2, N))
piano_bus = np.zeros((2, N))
fx_bus = np.zeros((2, N))

for start, name, cutoff in PAD:
    left, right = stereo_pad(CHORDS[name], 2.35, cutoff, gain=0.34)
    add_stereo(pad_bus, left, right, start)

# Bass: quarter-note pulse, root/fifth.
for start, name, _ in PAD:
    if start < 4.0 or 19.0 <= start < 21.0 or start >= 36.0:
        continue
    root = BASS_ROOT[name]
    fifth = FIFTH[name]
    for k, (offset, note, gain) in enumerate((
        (0.0, root, 1.0),
        (0.5, root, 0.72),
        (1.0, fifth, 0.86),
        (1.5, root, 0.64),
    )):
        add(bass_bus, bass_note(hz(note), gain=gain * 0.27), start + offset)

# Arp: 16ths through chord tones, quiet at the edges.
ARP_PATTERN = [0, 1, 2, 3, 2, 1, 2, 3]
for start, name, _ in PAD:
    if start < 4.0 or 19.0 <= start < 21.0 or start >= 36.0:
        continue
    tones = CHORDS[name] + [CHORDS[name][0] + 12]
    level = 0.135 if start >= 8.0 else 0.085
    for k in range(16):
        at = start + k * 0.125
        note = tones[ARP_PATTERN[k % len(ARP_PATTERN)] % len(tones)]
        pan = -0.55 if k % 2 == 0 else 0.55
        add(arp_bus, pluck(hz(note), dur=0.32, gain=level, bright=0.7), at, pan=pan)

# Drums.
for t in kick_times:
    add(drum_bus, kick(0.85 if t >= 8.0 else 0.6), t)
for t in soft_kicks:
    add(drum_bus, kick(0.42), t)
for t in snare_times:
    add(drum_bus, snare(0.34), t)
    add(drum_bus, clap(0.18), t + 0.006, pan=0.12)
for k, t in enumerate(hat_times):
    add(drum_bus, hat(0.15 if k % 2 == 0 else 0.095), t, pan=-0.18 if k % 2 else 0.18)

# Lead.
for at, note, gain in LEAD:
    n = int(0.85 * SR)
    tt = np.arange(n) / SR
    f = hz(note)
    vib = 0.0035 * np.sin(2.0 * np.pi * 5.1 * tt)
    phase = 2.0 * np.pi * f * (tt + np.cumsum(vib) / SR)
    sig = np.sin(phase) + 0.42 * np.sin(2.0 * np.pi * f * 2.0 * tt + 0.4)
    sig = lowpass(sig * np.exp(-tt * 2.8) * (1.0 - np.exp(-tt * 70.0)), 3200.0)
    add(lead_bus, sig * gain * 0.26, at)

# Piano.
for at, note, gain in PIANO:
    add(piano_bus, pluck(hz(note), dur=1.4, gain=gain, bright=1.15), at)

# FX: whooshes, ticks, riser, impact.
for at in WHOOSH_AT:
    add(fx_bus, whoosh(0.085 if at != 21.0 else 0.0), max(0.0, at - 0.45))
for at in TICKS:
    add(fx_bus, tick(0.085), at)
add(fx_bus, riser(2.0), 19.0)
add(fx_bus, impact(), 21.0)

# A reversed swell into the 21 s impact.
rev = riser(1.7)[::-1] * 0.55
add(fx_bus, rev, 19.3)

# ---------------------------------------------------------------- mix

# Sidechain the harmonic bed to the kick.
duck_env = duck(N, kick_times, depth=0.38, release=0.20)
pad_bus *= duck_env
bass_bus *= duck_env
arp_bus *= duck_env

ir = make_ir()

# Reverb sends (stereo IR, processed one channel at a time).
def send(bus, amount):
    out = np.zeros_like(bus)
    for c in range(2):
        out[c] = reverb(bus[c], ir[:, c]) * amount
    return out

pad_bus += send(pad_bus, 0.55)
lead_bus += send(lead_bus, 0.80)
piano_bus += send(piano_bus, 0.70)
arp_bus += send(arp_bus, 0.45)
fx_bus += send(fx_bus, 0.35)

# Ping-pong delay on the arp.
arp_delay = np.zeros_like(arp_bus)
arp_delay[0] = delay(arp_bus[0], 0.375, 0.26, 0.20)
arp_delay[1] = delay(arp_bus[1], 0.375, 0.26, 0.20)
arp_bus += arp_delay * 0.55

# Slow stereo air.
air_l = highpass(lowpass(rng.standard_normal(N), 1800.0), 180.0) * 0.0035
air_r = highpass(lowpass(rng.standard_normal(N), 1800.0), 180.0) * 0.0035

# Strip the harmonic bed before the hero; the riser and impact stay open.
bed = pad_bus + bass_bus + arp_bus + drum_bus + lead_bus + piano_bus
i0, i1 = int(18.7 * SR), int(21.0 * SR)
strip = np.linspace(1.0, 0.0, i1 - i0) ** 1.4
bed[:, i0:i1] *= strip
mix = bed + fx_bus
mix[0] += air_l
mix[1] += air_r

# Gentle bus glue, a high-shelf for air, and a short fade at the head/tail.
def shelf(x: np.ndarray, pivot: float = 2600.0, amount: float = 0.55) -> np.ndarray:
    n = len(x)
    f = np.fft.rfftfreq(n, 1.0 / SR)
    h = 1.0 + amount * (f ** 2) / (f ** 2 + pivot ** 2)
    return np.fft.irfft(np.fft.rfft(x) * h, n)

mix[0] = highpass(mix[0], 32.0)
mix[1] = highpass(mix[1], 32.0)
mix[0] = shelf(mix[0])
mix[1] = shelf(mix[1])
mix = np.tanh(mix * 1.08)
fade = int(0.6 * SR)
mix[:, :fade] *= np.linspace(0.0, 1.0, fade)
mix[:, -fade:] *= np.linspace(1.0, 0.0, fade)

peak = float(np.max(np.abs(mix)))
if peak > 1e-9:
    mix = mix / peak * 0.89


def write_wav(buf: np.ndarray, path: Path):
    frames = np.clip(buf.T, -1.0, 1.0)
    pcm = (frames * 32767.0).astype("<i2")
    with wave.open(str(path), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print("wrote", path, f"{len(buf[0]) / SR:.2f} s")


if __name__ == "__main__":
    here = Path(__file__).resolve().parent
    write_wav(mix, here / "score-40.wav")