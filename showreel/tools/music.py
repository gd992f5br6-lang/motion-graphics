"""Original soundtrack for the reel, synthesised from scratch (no samples).
120 BPM, A minor. Every scene cut sits on a bar line; risers, impacts and logo hits are placed on the
same timeline as the picture.  usage: python3 tools/music.py out/soundtrack.wav"""
import sys, numpy as np
from scipy import signal
from scipy.io import wavfile

SR = 48000; BPM = 120; BEAT = 60 / BPM; BAR = 4 * BEAT
DUR = 71.0
N = int(DUR * SR) + SR * 3
CUTS = [4, 16, 28, 40, 52, 64]
LOGO = [12.95, 25.8, 37.3, 49.2, 61.4]          # end-card reveals per chapter
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

# ---------------------------------------------------------------- arrangement
def section(t):
    for i, c in enumerate(CUTS):
        if t < c: return i  # 0 intro, 1 vyta ... 5 noctis
    return 6

# drums
for b in range(int(DUR / BEAT)):
    t = b * BEAT; s = section(t + 1e-6); beat_in_bar = b % 4
    if s in (1, 2, 3, 5) and t < 63.5:
        if not (s == 3 and t > 39.0) and not (s == 5 and 60.0 <= t):
            add('drums', kick(0.95), t)
        if beat_in_bar in (1, 3) and s in (1, 2, 3, 5) and not (s == 5 and t >= 60.0): add('drums', clap(), t, 0.42, 0.05)
        for k in range(4):  # 16th hats
            th = t + k * BEAT / 4
            if s == 2 and k % 2: continue
            if th < 63.5 and not (s == 5 and th >= 60.0):
                add('drums', hat(open_=(k == 2 and s in (3, 5))), th, (0.32 if k % 2 == 0 else 0.18) * (1.2 if s == 3 else 1.0), 0.25 * (1 if k % 2 else -1))
    if s == 4:  # family: soft groove, kick on 1 & 3 from bar 2
        if t >= 44 and beat_in_bar in (0, 2): add('drums', kick(0.6), t)
        if t >= 44 and beat_in_bar in (1, 3): add('drums', clap(), t, 0.22, -0.1)
        if t >= 42: add('drums', hat(), t + BEAT / 2, 0.16, 0.3)
# media: tom fills before the logo
for k, (tt, m) in enumerate([(59.0, 45), (59.25, 45), (59.5, 43), (59.75, 41), (60.0, 40), (60.25, 40), (60.5, 38), (60.75, 36)]):
    add('drums', tom(m), tt, 0.7, -0.3 + k * 0.08)

# bass: 8ths, octave bounce
for b in range(int(DUR / (BEAT / 2))):
    t = b * BEAT / 2; s = section(t + 1e-6)
    if s in (1, 2, 3, 5) and 4 <= t < 63.9 and not (s == 5 and 60.0 <= t < 61.4):
        root = CH[chord_at(t)][0]; m = root + (12 if b % 4 == 3 else 0)
        add('music', bass_note(m, BEAT / 2 * 0.9, 700 if s != 3 else 1100), t, 0.38)
    if s == 4 and t >= 44 and b % 2 == 0:
        root = CH[chord_at(t)][0]; add('music', bass_note(root, BEAT * 0.9, 500), t, 0.45)

# pads (every bar)
for bar in range(36):
    t = bar * BAR; s = section(t + 1e-6)
    if t >= DUR: break
    ch = CH[chord_at(t)][1] if t >= 4 else CH['Am'][1]
    bright = {0: 900, 1: 1600, 2: 2200, 3: 2600, 4: 1400, 5: 2400, 6: 1100}[s]
    gain = {0: 0.55, 1: 0.32, 2: 0.36, 3: 0.3, 4: 0.5, 5: 0.4, 6: 0.55}[s]
    if s == 6 and t > 66.1: continue
    add('pad', pad(ch, t, BAR, bright, gain), t)
add('pad', pad(CH['Am'][1] + [76], 66.0, 4.2, 1000, 0.55), 66.0)

# melodic layers
for b in range(int(DUR / (BEAT / 4))):
    t = b * BEAT / 4; s = section(t + 1e-6); ch = CH[chord_at(t)][1]
    if s == 1 and b % 2 == 0 and t >= 6:          # VYTA: pluck 8ths
        add('music', pluck(ch[(b // 2) % 4] + 12, 0.2, 5000), t, 0.42, 0.3 * np.sin(b))
    if s == 2 and b % 4 == 0:                      # VELORA: bells on beats
        add('music', bell(ch[(b // 4) % 5] + 12, 1.4), t, 0.45, 0.4 * np.sin(b * .7))
    if s == 3:                                     # QORE: 16th arp, filter opening
        u = (t - 28) / 12; m = ch[[0, 2, 4, 2, 1, 3, 4, 3][b % 8]] + 12
        add('music', pluck(m, 0.1, 1800 + 7000 * u), t, 0.34, 0.5 * np.sin(b * 1.3))
    if s == 4 and b % 4 == 0:                      # hearth: piano
        bb = b // 4
        if bb % 2 == 0 or t > 44: add('music', piano(ch[[0, 2, 1, 3, 4, 2][bb % 6]] + 12, 1.4), t, 0.55, -0.2 + 0.1 * (bb % 4))
    if s == 5 and b % 2 == 0 and t < 60:           # NOCTIS: pulsing supersaw stabs
        m = ch[(b // 2) % 3]; n = int(0.18 * SR)
        x = hp(lp(supersaw(mtof(m + 12), n, 5, 0.015), 5000), 250) * env_adsr(n, 0.003, 0.1, 0.3, 0.05, 0.13)
        add('music', x, t, 0.3, 0.4 * (1 if b % 4 else -1))

# transitions
for c in CUTS:
    add('fx', riser(1.6), c - 1.6, 0.42)
    add('fx', reverse_swell(1.0), c - 1.0, 0.5, 0.2)
    add('fx', impact(), c, 0.7)
    add('fx', whoosh(0.9), c - 0.42, 0.6, -0.5)
    add('fx', whoosh(0.9), c - 0.40, 0.6, 0.5)
add('fx', impact(), 0.05, 0.4)
# logo reveals
for k, t in enumerate(LOGO):
    ch = CH[chord_at(t)][1]
    add('fx', shimmer(ch, 3.2), t, 0.55)
    add('fx', whoosh(0.7), t - 0.35, 0.35, 0.3)
add('fx', braam([33, 45, 52, 57, 60]), 61.4, 0.7)
add('fx', impact(), 61.4, 0.6)
# UI ticks on callouts / stats / feed rows
for t in [8.7, 9.15, 9.6, 10.05, 20.35, 20.8, 21.2, 21.48, 21.76, 22.04, 24.85, 33.0, 33.32, 33.64, 33.96, 46.0, 58.1]:
    add('fx', tick(), t, 0.5, rng.uniform(-.4, .4))
add('fx', shimmer(CH['Am'][1], 4.0), 67.75, 0.5)

# ---------------------------------------------------------------- mix
def kick_env():
    e = np.zeros(N)
    for b in range(int(DUR / BEAT)):
        t = b * BEAT; s = section(t + 1e-6)
        if (s in (1, 2, 3, 5) and t < 63.5 and not (s == 3 and t > 39) and not (s == 5 and t >= 60)) or (s == 4 and t >= 44 and b % 4 in (0, 2)):
            i = int(t * SR); n = int(0.3 * SR); e[i:i + n] = np.maximum(e[i:i + n], np.exp(-np.arange(n) / SR * 9)[:len(e[i:i + n])])
    return e
duck = 1 - 0.55 * kick_env()

def reverb(x, sec=2.6, seed=0):
    r = np.random.default_rng(seed); n = int(sec * SR); t = np.arange(n) / SR
    ir = r.standard_normal(n) * np.exp(-t * 6.9 / sec); ir = lp(ir, 6000); ir[0] = 0
    return signal.fftconvolve(x, ir)[: len(x)] * 0.12

for k in ('music', 'pad'):
    busses[k][0] *= duck; busses[k][1] *= duck
mixL = busses['drums'][0] * 0.9 + busses['music'][0] * 0.8 + busses['pad'][0] * 0.7 + busses['fx'][0] * 0.8
mixR = busses['drums'][1] * 0.9 + busses['music'][1] * 0.8 + busses['pad'][1] * 0.7 + busses['fx'][1] * 0.8
sendL = busses['music'][0] * 0.6 + busses['pad'][0] * 0.4 + busses['fx'][0] * 0.7 + busses['drums'][0] * 0.08
sendR = busses['music'][1] * 0.6 + busses['pad'][1] * 0.4 + busses['fx'][1] * 0.7 + busses['drums'][1] * 0.08
mixL += reverb(sendL, 2.8, 1); mixR += reverb(sendR, 2.8, 2)
mixL = hp(mixL, 28); mixR = hp(mixR, 28)
mixL = mixL + 0.5 * hp(mixL, 2500) - 0.18 * bp(mixL, 150, 400); mixR = mixR + 0.5 * hp(mixR, 2500) - 0.18 * bp(mixR, 150, 400)
# master fade & limiter-ish
tt = np.arange(N) / SR
fade = np.clip((DUR - tt) / 1.2, 0, 1) * np.clip(tt / 0.05, 0, 1)
mixL *= fade; mixR *= fade
peak = max(np.abs(mixL).max(), np.abs(mixR).max())
mixL, mixR = mixL / peak * 1.6, mixR / peak * 1.6
mixL, mixR = np.tanh(mixL) * 0.89, np.tanh(mixR) * 0.89
out = np.stack([mixL, mixR], 1)[: int(DUR * SR)]
wavfile.write(sys.argv[1] if len(sys.argv) > 1 else 'out/soundtrack.wav', SR, (out * 32767).astype(np.int16))
print('wrote', out.shape[0] / SR, 's')
