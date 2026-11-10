#!/usr/bin/env python3
"""Mix the score and the ElevenLabs voiceover for the Quench promo film.

- VO: peak-normalised, high-passed, short plate send.
- Music: ducked under the VO with a smoothed envelope (no static volume).
- Output: promo/audio/mix.wav (48 kHz stereo). render.sh applies the final
  loudness normalisation to -15 LUFS / -1.5 dBTP.

No third-party samples. Python/numpy + ffmpeg for decoding only.
"""
from pathlib import Path
import subprocess
import wave
import numpy as np

SR = 48000
DUR = 40.0
N = int(SR * DUR)
ROOT = Path(__file__).resolve().parent
STARTS = {1: 3.2, 2: 8.2, 3: 13.2, 4: 18.2, 5: 21.6, 6: 26.2, 7: 31.2, 8: 36.2}
rng = np.random.default_rng(20261110)


def read_wav(path: Path) -> np.ndarray:
    with wave.open(str(path), "rb") as w:
        ch = w.getnchannels()
        width = w.getsampwidth()
        frames = w.readframes(w.getnframes())
    if width != 2:
        raise SystemExit(f"{path}: expected 16-bit PCM, got {width * 8}-bit")
    data = np.frombuffer(frames, dtype="<i2").astype(np.float64) / 32768.0
    if ch == 2:
        return data.reshape(-1, 2).T
    return data.reshape(1, -1)


def decode_vo(path: Path) -> np.ndarray:
    """Decode a VO line to mono 48 kHz float."""
    out = subprocess.run(
        [
            "ffmpeg", "-y", "-v", "error", "-i", str(path),
            "-ar", str(SR), "-ac", "1", "-f", "f32le", "-",
        ],
        stdout=subprocess.PIPE,
        check=True,
    ).stdout
    return np.frombuffer(out, dtype="<f4").astype(np.float64)


def highpass(x: np.ndarray, cutoff: float, order: int = 2) -> np.ndarray:
    n = len(x)
    spec = np.fft.rfft(x)
    f = np.fft.rfftfreq(n, 1.0 / SR)
    h = 1.0 / np.sqrt(1.0 + (max(cutoff, 1.0) / np.maximum(f, 1e-9)) ** (2 * order))
    return np.fft.irfft(spec * h, n)


def lowpass(x: np.ndarray, cutoff: float, order: int = 2) -> np.ndarray:
    n = len(x)
    spec = np.fft.rfft(x)
    f = np.fft.rfftfreq(n, 1.0 / SR)
    h = 1.0 / np.sqrt(1.0 + (f / max(cutoff, 1.0)) ** (2 * order))
    return np.fft.irfft(spec * h, n)


def make_ir(seconds: float = 0.75, decay: float = 7.0):
    n = int(seconds * SR)
    t = np.arange(n) / SR
    ir = rng.standard_normal((n, 2)) * np.exp(-t * decay)[:, None]
    for c in range(2):
        ir[:, c] = lowpass(ir[:, c], 6200.0)
    ir /= np.sqrt(np.sum(ir ** 2, axis=0, keepdims=True)) + 1e-9
    return ir


def reverb(x: np.ndarray, ir: np.ndarray) -> np.ndarray:
    n = len(x) + len(ir) - 1
    nfft = 1 << (n - 1).bit_length()
    return np.fft.irfft(np.fft.rfft(x, nfft) * np.fft.rfft(ir, nfft), nfft)[: len(x)]


def smooth_env(x: np.ndarray, attack: float = 0.008, release: float = 0.22,
               control: int = 500) -> np.ndarray:
    """Envelope follower at a low control rate, then linear interpolation."""
    hop = SR // control
    n = len(x) // hop
    blocks = np.abs(x[: n * hop]).reshape(n, hop).max(axis=1)
    out = np.empty(n)
    prev = 0.0
    a_att = np.exp(-1.0 / (attack * control))
    a_rel = np.exp(-1.0 / (release * control))
    for i, v in enumerate(blocks):
        coeff = a_att if v > prev else a_rel
        prev = coeff * prev + (1.0 - coeff) * v
        out[i] = prev
    # 40 ms lookahead so the music moves before the voice.
    shift = int(0.04 * control)
    if shift:
        out = np.concatenate([out[shift:], np.full(shift, out[-1])])
    full = np.interp(np.arange(N), np.arange(n) * hop, out)
    peak = float(np.max(full))
    return full / peak if peak > 1e-9 else full


# ---------------------------------------------------------------- music
music = read_wav(ROOT / "score-40.wav")
music = np.repeat(music, 2, axis=0)[:2] if music.shape[0] == 1 else music
music = music[:, :N]
if music.shape[1] < N:
    music = np.pad(music, ((0, 0), (0, N - music.shape[1])))
music *= 0.25  # bed level before ducking; the final loudnorm lifts the mix

# ---------------------------------------------------------------- voice
vo = np.zeros(N)
for idx, start in STARTS.items():
    line = decode_vo(ROOT / "vo" / f"line{idx}.wav")
    line = highpass(line, 90.0)
    peak = float(np.max(np.abs(line)))
    if peak > 1e-9:
        line = line / peak * 0.70
    i = int(start * SR)
    j = min(N, i + len(line))
    vo[i:j] += line[: j - i]

vo = highpass(vo, 85.0)

# Presence lift so the voice cuts through the bed without raising the level.
def presence(x: np.ndarray, pivot: float = 2800.0, amount: float = 0.24) -> np.ndarray:
    n = len(x)
    f = np.fft.rfftfreq(n, 1.0 / SR)
    h = 1.0 + amount * (f ** 2) / (f ** 2 + pivot ** 2)
    return np.fft.irfft(np.fft.rfft(x) * h, n)

vo = presence(vo)

# Short plate send for glue.
ir = make_ir()
vo_rev = np.zeros((2, N))
for c in range(2):
    vo_rev[c] = reverb(vo, ir[:, c])
vo_stereo = np.stack([vo, vo]) + vo_rev * 0.11

# ---------------------------------------------------------------- duck + sum
env = smooth_env(vo)
duck = 1.0 - 0.60 * env  # about -8 dB under speech
music *= duck

mix = music + vo_stereo
mix = np.tanh(mix * 1.05)
peak = float(np.max(np.abs(mix)))
if peak > 1e-9:
    mix = mix / peak * 0.89


def write_wav(buf: np.ndarray, path: Path):
    pcm = (np.clip(buf.T, -1.0, 1.0) * 32767.0).astype("<i2")
    with wave.open(str(path), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print("wrote", path, f"{len(buf[0]) / SR:.2f} s")


if __name__ == "__main__":
    write_wav(vo_stereo / max(1e-9, np.max(np.abs(vo_stereo))) * 0.7, ROOT / "vo-mix.wav")
    write_wav(mix, ROOT / "mix.wav")
    print(
        "levels: music peak",
        round(float(np.max(np.abs(music))), 3),
        "· vo peak",
        round(float(np.max(np.abs(vo_stereo))), 3),
        "· duck min",
        round(float(np.min(duck)), 3),
    )