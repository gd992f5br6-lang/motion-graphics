"""Synth building blocks shared by the soundtrack (instruments, filters, bus helpers). No samples."""
import sys, numpy as np
from scipy import signal
from scipy.io import wavfile

SR = 48000; BPM = 120; BEAT = 60 / BPM; BAR = 4 * BEAT
DUR = float(__import__("os").environ.get("DUR", "55"))
N = int(DUR * SR) + SR * 3
rng = np.random.default_rng(7)

L = np.zeros(N); R = np.zeros(N)              # master bus
busses = {k: [np.zeros(N), np.zeros(N)] for k in ['drums', 'music', 'pad', 'fx']}

def mtof(m): return 440.0 * 2 ** ((m - 69) / 12)
def env_adsr(n, a, d, s, r, sus_len):
    a, d, r = int(a * SR), int(d * SR), int(r * SR); sl = max(0, int(sus_len * SR) - a - d)
    e = np.concatenate([np.linspace(0, 1, max(a, 1)), np.linspace(1, s, max(d, 1)), np.full(sl, s), np.linspace(s, 0, max(r, 1))])
    return e[:n] if len(e) >= n else np.pad(e, (0, n - len(e)))
def add(bus, x, t, gain=1.0, pan=0.0):
    i = int(t * SR); x = x[: max(0, N - i)]
    if i < 0: x = x[-i:]; i = 0
    gl, gr = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    busses[bus][0][i:i + len(x)] += x * gain * gl * 1.414
    busses[bus][1][i:i + len(x)] += x * gain * gr * 1.414
def lp(x, fc, order=2): return signal.sosfilt(signal.butter(order, min(fc, SR * .45), 'low', fs=SR, output='sos'), x)
def hp(x, fc, order=2): return signal.sosfilt(signal.butter(order, fc, 'high', fs=SR, output='sos'), x)
def bp(x, f1, f2, order=2): return signal.sosfilt(signal.butter(order, [f1, min(f2, SR * .45)], 'band', fs=SR, output='sos'), x)
def sweep_lp(x, f0, f1, block=256, curve=2.0):
    """time-varying low-pass (exponential sweep f0 -> f1)"""
    out = np.zeros_like(x); zi = None; nb = len(x) // block + 1
    for b in range(nb):
        u = (b / max(nb - 1, 1)) ** curve; fc = f0 * (f1 / f0) ** u
        sos = signal.butter(2, min(fc, SR * .45), 'low', fs=SR, output='sos')
        if zi is None: zi = signal.sosfilt_zi(sos) * 0
        seg = x[b * block:(b + 1) * block]
        if len(seg) == 0: break
        out[b * block:b * block + len(seg)], zi = signal.sosfilt(sos, seg, zi=zi)
    return out
def saw(f, n, detune=0.0, phase=None):
    t = np.arange(n) / SR; ph = rng.random() if phase is None else phase
    return 2 * ((t * f * (1 + detune) + ph) % 1) - 1
def supersaw(f, n, voices=5, spread=0.012):
    return sum(saw(f, n, detune=spread * (v - (voices - 1) / 2) / ((voices - 1) / 2)) for v in range(voices)) / voices
def sine(f, n, ph=0): return np.sin(2 * np.pi * f * np.arange(n) / SR + ph)

# ---------------------------------------------------------------- harmony
CH = {  # bass root, chord tones (midi)
    'Am': (45, [57, 60, 64, 67, 71]),
    'F': (41, [53, 57, 60, 64, 67]),
    'C': (48, [55, 60, 62, 64, 67]),
    'G': (43, [55, 59, 62, 64, 66]),
}
PROG = ['Am', 'F', 'C', 'G']
def chord_at(t):
    b = int(np.floor((t - 4) / BAR)) if t >= 4 else -1
    return PROG[b % 4] if b >= 0 else 'Am'

# ---------------------------------------------------------------- instruments
def kick(gain=1.0):
    n = int(0.6 * SR); t = np.arange(n) / SR
    f = 45 + 110 * np.exp(-t * 28); ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t * 6.5)
    click = hp(rng.standard_normal(n) * np.exp(-t * 400), 2000) * 0.25
    return np.tanh((body + click) * 1.6) * gain
def clap():
    n = int(0.4 * SR); t = np.arange(n) / SR; x = rng.standard_normal(n)
    e = sum(np.exp(-np.clip(t - d, 0, None) * 90) * (t >= d) for d in (0, .011, .022)) + 0.6 * np.exp(-t * 14)
    return bp(x * e, 900, 5200) * 1.2
def hat(open_=False):
    n = int((0.25 if open_ else 0.06) * SR); t = np.arange(n) / SR
    return hp(rng.standard_normal(n), 7000, 4) * np.exp(-t * (14 if open_ else 70)) * 0.85
def tom(m):
    n = int(0.7 * SR); t = np.arange(n) / SR; f = mtof(m) * (1 + 0.5 * np.exp(-t * 20))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 5) * 0.9
def bass_note(m, dur, cutoff=900):
    n = int((dur + 0.05) * SR)
    x = saw(mtof(m), n) * 0.6 + sine(mtof(m), n) * 0.7 + sine(mtof(m - 12), n) * 0.5
    e = env_adsr(n, 0.004, 0.12, 0.55, 0.05, dur)
    return lp(x, cutoff) * e
def pluck(m, dur=0.25, bright=4000):
    n = int((dur + 0.6) * SR); t = np.arange(n) / SR
    x = saw(mtof(m), n, 0.003) + saw(mtof(m), n, -0.003)
    f = bright * np.exp(-t * 10) + 300
    y = sweep_lp(x, bright, 300, curve=0.5) * np.exp(-t * 5.5)
    return y * 0.35
def bell(m, dur=1.6):
    n = int(dur * SR); t = np.arange(n) / SR; f = mtof(m)
    mod = np.sin(2 * np.pi * f * 3.5 * t) * 2.2 * np.exp(-t * 3)
    return np.sin(2 * np.pi * f * t + mod) * np.exp(-t * 2.6) * 0.32
def pad(chord, t0, dur, bright=1800, gain=1.0):
    n = int((dur + 1.2) * SR); x = np.zeros(n)
    for m in chord: x += supersaw(mtof(m), n, 5, 0.01) * 0.3
    x = hp(lp(x, bright * 1.8, 2), 170)
    e = env_adsr(n, 0.6, 0.4, 0.85, 1.2, dur)
    return x * e * gain
def piano(m, dur=1.2):
    n = int((dur + 1.0) * SR); t = np.arange(n) / SR; f = mtof(m)
    x = sum(np.sin(2 * np.pi * f * k * t) * (0.6 / k ** 1.4) * np.exp(-t * (1.6 + k * 0.9)) for k in range(1, 8))
    return x * 0.5 * (1 - np.exp(-t * 400))
def riser(dur):
    n = int(dur * SR); t = np.arange(n) / SR; u = t / dur
    noise = rng.standard_normal(n)
    x = sweep_lp(hp(noise, 300), 400, 12000, curve=1.6) * (u ** 2.2)
    tone = np.sin(2 * np.pi * np.cumsum(200 + 900 * u ** 2) / SR) * u ** 3 * 0.15
    return (x * 0.5 + tone)
def reverse_swell(dur):
    n = int(dur * SR); t = np.arange(n) / SR
    x = hp(rng.standard_normal(n), 2500) * np.exp(-(dur - t) * 3.5)
    return x * 0.4
def impact():
    n = int(3.0 * SR); t = np.arange(n) / SR
    f = 28 + 70 * np.exp(-t * 6); boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 1.6)
    crack = lp(rng.standard_normal(n), 3000) * np.exp(-t * 9) * 0.6
    tail = lp(rng.standard_normal(n), 600) * np.exp(-t * 2.2) * 0.3
    return np.tanh((boom * 1.4 + crack + tail) * 1.2)
def whoosh(dur=0.9):
    n = int(dur * SR); t = np.arange(n) / SR; u = t / dur
    x = rng.standard_normal(n); y = np.zeros(n); blk = 256
    for b in range(0, n, blk):
        c = 300 * (25 ** np.sin(np.pi * (b / n)))
        y[b:b + blk] = bp(x[b:b + blk], c * 0.6, c * 1.6, 1)
    return y * np.sin(np.pi * u) ** 2 * 0.8
def braam(chord, dur=3.0):
    n = int(dur * SR); t = np.arange(n) / SR; x = np.zeros(n)
    for m in chord: x += supersaw(mtof(m), n, 7, 0.02) * 0.35
    x = sweep_lp(x, 200, 2500, curve=0.4) * np.minimum(1, t / 0.08) * np.exp(-t * 0.9)
    return np.tanh(x * 1.5) * 0.7
def tick():
    n = int(0.03 * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * 2400 * t) * np.exp(-t * 300) + hp(rng.standard_normal(n), 5000) * np.exp(-t * 500) * 0.3) * 0.5
def shimmer(chord, dur=3.5):
    n = int(dur * SR); x = np.zeros(n)
    for k, m in enumerate(chord):
        b = bell(m + 12, dur); x[int(k * 0.04 * SR):] += b[: n - int(k * 0.04 * SR)]
    return x * 0.6

