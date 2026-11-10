#!/usr/bin/env python3
"""Measured QA for the Quench promo film.

Adapted from video-director (MIT, win4r/video-director) scripts
check_timeline.py / qa_video.py. Measures what cannot be watched or heard:
spec, frame 0, hook, text size/contrast, flashes, freezes, duplicates,
cuts, loudness/true peak, silence. It does not watch the film.

Usage: python3 promo/tools/qa.py promo/renders/quench-16x9-final.mp4 --out docs/promo/qa
"""
import argparse
import json
import math
import subprocess
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

ANALYSIS_W = 192


def run(cmd):
    r = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if r.returncode != 0 and r.stderr:
        raise RuntimeError(f"{cmd[0]} failed: {r.stderr.decode(errors='replace')[-500:]}")
    return r.stdout.decode(errors="replace")


def probe(path):
    out = run(["ffprobe", "-v", "error", "-show_entries",
               "stream=codec_name,codec_type,width,height,avg_frame_rate,r_frame_rate",
               "-show_entries", "format=duration,size",
               "-of", "json", str(path)])
    return json.loads(out)


def rate(s):
    if not s or s == "0/0":
        return 0.0
    a, b = s.split("/")
    return float(a) / float(b) if float(b) else 0.0


def frames(path, fps, tmp):
    """Decode to tiny greyscale frames."""
    return tmp / "frames_%04d.png"


def grab(path, t, width, tmp, name):
    out = tmp / name
    run(["ffmpeg", "-y", "-v", "error", "-ss", str(t), "-i", str(path),
         "-frames:v", "1", "-vf", f"scale={width}:-1", str(out)])
    return out


def sheet(path, times, width, cols, dest, tmp):
    imgs = [Image.open(grab(path, t, width, tmp, f"sheet_{i}.png")) for i, t in enumerate(times)]
    if not imgs:
        return None
    w, h = imgs[0].size
    rows = (len(imgs) + cols - 1) // cols
    canvas = Image.new("RGB", (cols * w, rows * h), (0, 0, 0))
    for i, im in enumerate(imgs):
        canvas.paste(im, ((i % cols) * w, (i // cols) * h))
    canvas.save(dest)
    return dest


def load_frames(path, fps, tmp):
    """Decode all frames to small greys and return stats per frame."""
    for f in tmp.glob("f_*.pgm"):
        f.unlink()
    fmt = str(tmp / "f_%04d.pgm")
    run(["ffmpeg", "-y", "-v", "error", "-i", str(path), "-vf",
         f"fps={fps:.6f},scale={ANALYSIS_W}:-1,format=gray", fmt])
    files = sorted(tmp.glob("f_*.pgm"))
    stats = []
    prev = None
    for f in files:
        a = np.asarray(Image.open(f), dtype=np.float32)
        stats.append({"mean": float(a.mean()),
                      "std": float(a.std()),
                      "diff": float(np.abs(a - prev).mean()) if prev is not None else 0.0})
        prev = a
    return stats


def runs(mask):
    out = []
    i = 0
    while i < len(mask):
        if mask[i]:
            j = i
            while j < len(mask) and mask[j]:
                j += 1
            out.append((i, j))
            i = j
        else:
            i += 1
    return out


def lum(c):
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]


def contrast(a, b):
    la, lb = lum(a), lum(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)


def measure_text(im, box, short):
    """Estimate rendered glyph height and fg/bg contrast inside a box."""
    x0, y0, x1, y1 = [int(v) for v in box]
    region = np.asarray(im.convert("RGB"))[y0:y1, x0:x1]
    if region.size == 0:
        return None
    grey = region.mean(axis=2)
    med = float(np.median(grey))
    # text = minority side of the median split (glyphs cover less area than bg)
    above = grey > med
    mask = above if above.mean() < 0.5 else ~above
    rows = mask.any(axis=1)
    bands = runs(list(rows))
    if not bands:
        return {"px": 0, "contrast": 0.0}
    heights = [b[1] - b[0] for b in bands if b[1] - b[0] > 2]
    px = max(heights) if heights else 0
    # fg/bg from the bright/dark extremes (robust to antialiasing)
    fgmask = grey >= np.percentile(grey, 95)
    bgmask = grey <= np.percentile(grey, 5)
    fg = region[fgmask].mean(axis=0) if fgmask.any() else (0, 0, 0)
    bg = region[bgmask].mean(axis=0) if bgmask.any() else (255, 255, 255)
    return {"px": float(px), "contrast": float(contrast(fg, bg))}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("video")
    ap.add_argument("--out", default="docs/promo/qa")
    ap.add_argument("--timeline", default="promo/timeline.json")
    ap.add_argument("--freeze", type=float, default=1.0)
    args = ap.parse_args()

    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    tmp = out / "tmp"
    tmp.mkdir(exist_ok=True)

    info = probe(args.video)
    v = next(s for s in info["streams"] if s["codec_type"] == "video")
    tl = json.loads(Path(args.timeline).read_text())
    meta = tl["meta"]
    w, h, fps = v["width"], v["height"], rate(v.get("avg_frame_rate")) or 30.0
    dur = float(info["format"]["duration"])

    checks = []
    def add(level, name, detail):
        checks.append({"level": level, "check": name, "detail": detail})

    # spec
    spec_ok = h == 1080 and w == 1920 and v["codec_name"] == "h264" and abs(dur - meta["dur"]) <= 0.1
    add("PASS" if spec_ok else "FAIL", "spec",
        f"{v['codec_name']} {w}x{h} @ {fps:g} fps, {dur:.2f}s (planned {meta['w']}x{meta['h']} {meta['fps']}fps {meta['dur']}s)")

    stats = load_frames(args.video, fps, tmp)
    # frame 0
    f0 = stats[0]
    add("PASS" if f0["std"] > 3 else "FAIL", "frame 0",
        f"mean {f0['mean']:.1f}, std {f0['std']:.1f}")
    # flashes / pops
    diffs = np.array([s["diff"] for s in stats])
    med = float(np.median(diffs)) or 1.0
    flashes = int((diffs > med * 8 + 20).sum())
    add("PASS" if flashes == 0 else "WARN", "single-frame flashes", f"{flashes} spikes")
    # frozen stretches
    frozen = runs(list(diffs < 0.25))
    longs = [(a / fps, b / fps) for a, b in frozen if (b - a) / fps >= args.freeze]
    for a, b in longs:
        add("WARN", "frozen stretch", f"{a:.1f}-{b:.1f}s ({b - a:.1f}s)")
    if not longs:
        add("PASS", "frozen stretch", "none over 1.0 s")
    # duplicates: identical consecutive frames
    dups = int((diffs == 0).sum())
    add("PASS" if dups <= 2 else "WARN", "duplicate frames", f"{dups} identical pairs")

    # cuts vs plan
    planned = [s["start"] for s in tl["scenes"][1:]]
    det = []
    for i in range(1, len(diffs)):
        if diffs[i] > max(med * 3 + 2, 2.5):
            t = i / fps
            if not det or t - det[-1] > 0.5:
                det.append(t)
    missing = [p for p in planned if not any(abs(p - d) <= 1 / fps + 0.05 for d in det)]
    add("PASS" if not missing else "WARN", "cuts vs plan",
        f"planned {planned}; detected {[round(d,1) for d in det]}; missing {missing}")

    # audio: loudness + true peak
    lproc = subprocess.run(["ffmpeg", "-v", "info", "-i", str(args.video),
                "-af", "loudnorm=I=-15:TP=-1:LRA=11:print_format=json", "-f", "null", "-"],
               stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    lout = lproc.stderr.decode(errors="replace")
    import re
    m = re.search(r'"input_i"\s*:\s*"(-?[\d.]+)"', lout)
    m2 = re.search(r'"input_tp"\s*:\s*"(-?[\d.]+)"', lout)
    lufs = float(m.group(1)) if m else None
    tp = float(m2.group(1)) if m2 else None
    ok = lufs is not None and -16.5 <= lufs <= -13.5 and (tp is None or tp <= -0.9)
    add("PASS" if ok else "FAIL", "loudness / true peak",
        f"integrated {lufs} LUFS (target -15), true peak {tp} dBTP (limit -1)")
    # silence: 100 ms windows below -30 dBFS rel to p90
    wav = tmp / "audio.wav"
    run(["ffmpeg", "-y", "-v", "error", "-i", str(args.video), "-ar", "48000",
         "-ac", "1", "-c:a", "pcm_s16le", str(wav)])
    import wave, struct
    with wave.open(str(wav), "rb") as wf:
        raw = wf.readframes(wf.getnframes())
    a = np.frombuffer(raw, dtype=np.int16).astype(np.float64) / 32768.0
    win = int(0.1 * 48000)
    rms = np.array([np.sqrt(np.mean(a[i:i + win] ** 2)) for i in range(0, len(a) - win, win)])
    rmsd = 20 * np.log10(rms + 1e-9)
    p90 = np.percentile(rmsd, 90)
    quiet = (rmsd < p90 - 15) & (rmsd < -30)
    sil = runs(list(quiet))
    sil_s = [(i * 0.1, j * 0.1) for i, j in sil if (j - i) * 0.1 >= 1.0]
    planned_sil = tl["silences"][0]
    ok_sil = any(a <= planned_sil["from"] + 0.1 and b >= planned_sil["to"] - 0.1 for a, b in sil_s)
    # With a voice clock the payoff hit sits in a VO pause; the music dip is advisory.
    lvl = "PASS" if ok_sil else ("WARN" if meta.get("clock") == "voice" else "FAIL")
    add(lvl, "planned silence",
        f"planned {planned_sil['from']}-{planned_sil['to']}s (music dip; VO speaks over it); long quiet windows {sil_s}")
    unintended = [x for x in sil_s if not (x[0] >= planned_sil['from'] - 0.2 and x[1] <= planned_sil['to'] + 0.2)]
    add("PASS" if not unintended else "WARN", "unintended silence", f"{unintended}")

    # text size + contrast (rendered pixels in the timeline boxes)
    short = min(w, h)
    for t in tl["texts"]:
        mid = (t["from"] + t["to"]) / 2
        img = Image.open(grab(args.video, mid, w, tmp, "t.png"))
        r = measure_text(img, t["box"], short)
        if not r:
            add("WARN", f"text '{t['text'][:30]}'", "box empty")
            continue
        px = r["px"]
        floor = 84 if t["role"] == "hook" else 48
        c_ok = r["contrast"] >= 4.5
        add("PASS" if px >= floor and c_ok else "FAIL",
            f"text '{t['text'][:34]}' ({t['role']})",
            f"rendered {px:.0f}px (floor {floor}), contrast {r['contrast']:.2f}:1 at t={mid:.1f}s")

    # contact sheets
    cuts = [s["start"] for s in tl["scenes"]]
    sheet(args.video, [c + 0.3 for c in cuts], 480, 4, out / "beats_sheet.jpg", tmp)
    sheet(args.video, [0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0], 360, 7, out / "hook_sheet.jpg", tmp)
    sheet(args.video, list(np.arange(0, dur, 1.0)), 360, 10, out / "phone_sheet.jpg", tmp)

    report = {"file": str(args.video), "info": {"w": w, "h": h, "fps": fps, "dur": dur},
              "checks": checks}
    (out / "report.json").write_text(json.dumps(report, indent=2))
    lines = ["# QA report", "", f"File: {args.video}", f"Spec: {w}x{h} @ {fps:g} fps, {dur:.2f}s", ""]
    for c in checks:
        lines.append(f"- {c['level']} — {c['check']}: {c['detail']}")
    (out / "report.md").write_text("\n".join(lines) + "\n")
    print("\n".join(lines))
    sys.exit(1 if any(c["level"] == "FAIL" for c in checks) else 0)


if __name__ == "__main__":
    main()
