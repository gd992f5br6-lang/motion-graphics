"""Score + sound design for the ad, synthesised from scratch (no samples): python3 audio.py -> work/audio.wav
120 bpm, one bar = 2 s. Every hit sits on an event of the animation timeline (see ad.src.html)."""
import numpy as np, wave, pathlib

SR = 48000
T = 34.5
N = int(SR * T)
rng = np.random.default_rng(7)
STEMS = {}
D = pathlib.Path(__file__).resolve().parent

def put(x, t, gain=1.0, pan=0.0, stem='fx'):
    if stem not in STEMS: STEMS[stem] = (np.zeros(N), np.zeros(N))
    L, R = STEMS[stem]
    i = int(t * SR)
    if i >= N: return
    x = x[: N - i] * gain
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    L[i:i + len(x)] += x * l * 1.414; R[i:i + len(x)] += x * r * 1.414

def env(n, a=0.002, d=0.2):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-6)) * np.exp(-t / d)

def biquad(x, kind, f, q=0.707):
    w = 2 * np.pi * f / SR; al = np.sin(w) / (2 * q); c = np.cos(w)
    if kind == 'lp': b = [(1 - c) / 2, 1 - c, (1 - c) / 2]
    elif kind == 'hp': b = [(1 + c) / 2, -(1 + c), (1 + c) / 2]
    else: b = [al, 0, -al]  # band
    a = [1 + al, -2 * c, 1 - al]
    b = [v / a[0] for v in b]; a = [1, a[1] / a[0], a[2] / a[0]]
    y = np.zeros_like(x); x1 = x2 = y1 = y2 = 0.0
    for i, xi in enumerate(x):
        yi = b[0] * xi + b[1] * x1 + b[2] * x2 - a[1] * y1 - a[2] * y2
        x2, x1, y2, y1 = x1, xi, y1, yi; y[i] = yi
    return y

def sweep_band(x, f0, f1, q=1.2, steps=24):
    """band-pass whose centre glides f0 -> f1 (piecewise, crossfaded)"""
    out = np.zeros_like(x); seg = len(x) // steps
    for k in range(steps):
        f = f0 * (f1 / f0) ** (k / (steps - 1))
        a, b = max(0, k * seg - seg // 2), min(len(x), (k + 1) * seg + seg // 2)
        y = biquad(x[a:b], 'bp', f, q); w = np.hanning(len(y)); out[a:b] += y * w
    return out

# ---------------- instruments ----------------
def kick(big=False):
    n = int(0.45 * SR); t = np.arange(n) / SR
    f = 46 + 130 * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) * np.exp(-t / (0.32 if big else 0.2))
    click = biquad(rng.standard_normal(n) * env(n, 0.0005, 0.004), 'hp', 2500) * 0.5
    return np.tanh((x + click) * (1.6 if big else 1.3)) * 0.9

def clap():
    n = int(0.3 * SR); x = rng.standard_normal(n); e = np.zeros(n)
    for o, d in ((0, 0.012), (0.011, 0.012), (0.022, 0.012), (0.033, 0.09)):
        i = int(o * SR); e[i:] += env(n - i, 0.0008, d)
    return biquad(x * e, 'bp', 1400, 0.8) * 1.6

def hat(open_=False):
    n = int((0.18 if open_ else 0.05) * SR)
    x = biquad(rng.standard_normal(n), 'hp', 8000) * env(n, 0.0005, 0.06 if open_ else 0.012)
    return x * 0.5

def note_f(m): return 440 * 2 ** ((m - 69) / 12)

def pluck(m, dur=0.6, bright=1.0):
    n = int(dur * SR); t = np.arange(n) / SR; f = note_f(m)
    x = sum(np.sin(2 * np.pi * f * k * t + k) * (bright ** (k - 1)) / k for k in range(1, 7))
    x *= env(n, 0.003, dur * 0.35)
    return biquad(x, 'lp', 2600 + 1200 * bright) * 0.22

def sub(m, dur):
    n = int(dur * SR); t = np.arange(n) / SR; f = note_f(m)
    x = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(4 * np.pi * f * t)
    e = np.minimum(1, t / 0.008) * np.minimum(1, (dur - t) / 0.03).clip(0)
    return np.tanh(x * 1.4) * e * 0.42

def noise_whoosh(dur=0.42, f0=500, f1=5200, gain=0.5):
    n = int(dur * SR); x = rng.standard_normal(n)
    e = np.sin(np.pi * np.linspace(0, 1, n)) ** 1.6
    return sweep_band(x, f0, f1, 1.4) * e * gain

def thud(pitch=1.0):
    n = int(0.16 * SR); t = np.arange(n) / SR
    body = np.sin(2 * np.pi * (180 * pitch) * t * (1 - t * 2)) * np.exp(-t / 0.035)
    paper = biquad(rng.standard_normal(n), 'bp', 2200 * pitch, 0.9) * env(n, 0.0005, 0.02)
    return (body * 0.7 + paper * 0.9) * 0.8

def slap():
    n = int(0.16 * SR)
    x = biquad(rng.standard_normal(n), 'bp', 1800, 0.7) * env(n, 0.0004, 0.03)
    return (x * 1.5 + thud(0.8)) * 0.9

def tap():
    n = int(0.05 * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * 2300 * t) * np.exp(-t / 0.006) + biquad(rng.standard_normal(n), 'hp', 4000) * env(n, 0.0002, 0.003) * 0.4) * 0.5

def flip():
    n = int(0.2 * SR); x = rng.standard_normal(n)
    e = np.sin(np.pi * np.linspace(0, 1, n)) ** 3
    return sweep_band(x, 1200, 4800, 2.0, 12) * e * 0.55

def chime(ms, dur=0.5, gain=0.18, gap=0.07):
    out = np.zeros(int((dur + gap * len(ms)) * SR))
    for k, m in enumerate(ms):
        n = int(dur * SR); t = np.arange(n) / SR; f = note_f(m)
        x = (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t / 0.05)) * env(n, 0.002, dur * 0.3)
        i = int(k * gap * SR); out[i:i + n] += x
    return out * gain

def riser(dur):
    n = int(dur * SR); t = np.linspace(0, 1, n)
    x = sweep_band(rng.standard_normal(n), 300, 7000, 2.5, 30) * t ** 2.2
    tone = np.sin(2 * np.pi * np.cumsum(220 * 2 ** (t * 2)) / SR) * t ** 3 * 0.15
    return (x * 0.6 + tone)

def keyclick(k=0):
    n = int(0.03 * SR); g = np.random.default_rng(100 + k)
    x = biquad(g.standard_normal(n), 'bp', 3200 + 500 * (k % 3), 1.2) * env(n, 0.0003, 0.006)
    return x * 0.7

def boom():
    n = int(1.4 * SR); t = np.arange(n) / SR
    f = 34 + 70 * np.exp(-t * 6); x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.55)
    hit = biquad(rng.standard_normal(n), 'lp', 900) * env(n, 0.001, 0.12) * 0.6
    return np.tanh((x + hit) * 1.4) * 0.9

def pad(ms, dur, gain=0.08):
    n = int(dur * SR); t = np.arange(n) / SR; out = np.zeros(n)
    for m in ms:
        for det in (-0.08, 0.08):
            f = note_f(m + det); out += np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t)
    e = np.minimum(1, t / 0.5) * np.minimum(1, (dur - t) / 0.6).clip(0)
    return biquad(out * e, 'lp', 1800) * gain

def shimmer(dur):
    n = int(dur * SR); t = np.arange(n) / SR; out = np.zeros(n)
    for k, m in enumerate((96, 100, 103, 108)):
        out += np.sin(2 * np.pi * note_f(m) * t) * (0.5 + 0.5 * np.sin(2 * np.pi * (3 + k) * t))
    return out * np.sin(np.pi * t / dur) * 0.05

# ---------------- score: 120 bpm, grid anchored on the logo hit at 5.46 ----------------
G0 = 5.46
PROG = [(41, [65, 68, 72]), (37, [65, 68, 73]), (44, [63, 68, 72]), (39, [63, 67, 70])]   # Fm Db Ab Eb
GROOVE = [(5.46, 11.6), (12.9, 18.4), (19.45, 26.1), (31.0, 33.9)]
LIGHT = [(26.1, 30.9)]
def chord_at(t): return PROG[int(max(0, t - G0) // 2) % 4]
def in_any(t, spans): return any(a <= t < b for a, b in spans)
e = 0
while True:
    te = G0 + e * 0.25
    if te >= 33.9: break
    pos = e % 8; root, ch = chord_at(te)
    if in_any(te, GROOVE):
        if pos in (0, 3, 5): put(kick(), te, 0.85, stem='kick')
        if pos in (2, 6): put(clap(), te, 0.45, 0.05, stem='clap')
        put(hat(open_=(pos == 7)), te, 0.42 if pos % 2 else 0.22, 0.25, stem='hat')
        if pos in (0, 3, 5): put(sub(root + 12, 0.45 if pos == 3 else 0.6), te, 0.85, stem='bass')
        if pos in (0, 3, 6): [put(pluck(m, 0.5, 0.6), te, 0.55, (m - 68) / 12, stem='keys') for m in ch]
    elif in_any(te, LIGHT):
        put(hat(), te, 0.18 if pos % 2 else 0.1, 0.25, stem='hat')
        if pos in (0, 4): [put(pluck(m + 12, 0.4, 0.8), te, 0.4, (m - 68) / 12, stem='keys') for m in ch[:2]]
    e += 1
# intro: airy pluck arpeggio before the beat starts, a pad under the bright break
for k, tt in enumerate(np.arange(0.0, 4.4, 0.25)):
    root, ch = PROG[int(tt // 2) % 4]; put(pluck(ch[k % 3] + 12, 0.45, 0.9), tt, 0.5, (-0.3, 0.3)[k % 2], stem='keys')
put(pad([65, 68, 72], 4.6), 0.0, 1.0, stem='keys'); put(pad([63, 68, 72], 1.2), 11.9, 1.2, stem='keys')
put(pad([65, 68, 72, 77], 3.6), 30.9, 1.1, stem='keys')
for m in PROG[0][1] + [77]: put(pluck(m, 1.6, 0.9), 33.9, 0.8, (m - 68) / 14, stem='keys')
put(sub(53, 1.0), 33.9, 0.9, stem='bass'); put(kick(True), 33.9, 0.8, stem='kick')

# ---------------- sound design on the picture ----------------
words = [0.06, 0.24, 0.35, 0.48, 0.64, 1.55, 1.66, 1.84, 2.56, 2.86, 4.45, 4.58, 4.72, 4.86, 19.5, 19.65, 19.85, 20.0,
         23.64, 24.18, 24.56, 26.12, 27.2, 27.68]
for i, tt in enumerate(words): put(tap(), tt + 0.02, 0.35, (-0.2, 0.2)[i % 2])
for tt in (1.26, 2.28, 6.42, 10.55, 12.5, 14.18, 18.15, 19.02, 21.28, 23.48, 25.8, 30.75): put(noise_whoosh(0.45, 4000, 500, 0.5), tt, 0.8, 0.1)
for tt in (1.48, 3.18, 6.85, 9.0, 12.8, 14.25, 20.3, 21.45, 23.65, 26.1): put(noise_whoosh(0.4, 600, 5200, 0.5), tt - 0.12, 0.7, -0.1)
for k in range(8): put(flip(), 1.62 + k * 0.045, 0.35, -0.4 + k * 0.1)
put(riser(0.4), 3.8, 0.4); put(noise_whoosh(0.5, 300, 3000, 0.6), 4.05, 0.8)   # zoom-out and lime flood
put(riser(1.0), 4.45, 0.45); put(noise_whoosh(0.35, 800, 6000, 0.5), 5.1, 0.9)   # build, mark swoops in
put(boom(), 5.46, 1.0); put(shimmer(0.7), 5.5, 1.0)
for k in range(10): put(tap(), 5.92 + k * 0.03, 0.25, 0.2)                           # wordmark letters
def typing(t0, t1, gain=0.55, step=0.035):
    for k, tt in enumerate(np.arange(t0, t1, step)): put(keyclick(k), tt, gain, 0.15)
typing(6.95, 7.45); typing(7.85, 8.6); typing(11.96, 12.26); typing(12.36, 12.78, 0.4, 0.045); typing(13.05, 13.8); typing(22.0, 22.3, 0.4); typing(22.25, 22.85, 0.4)
put(thud(1.1), 8.12, 0.8); put(shimmer(0.5), 8.14, 0.8)                              # product dropped in
for tt in (9.95, 13.94, 15.15, 17.95, 33.4): put(tap(), tt, 1.0, 0.1)
put(noise_whoosh(0.5, 2000, 400, 0.4), 9.98, 0.7); put(chime([84, 91], 0.4, 0.12), 9.97, 1.0)   # send + ripple
put(chime([88, 95, 100], 0.5, 0.12, 0.05), 13.95, 1.0)                                # Generate
put(thud(1.2), 17.22, 0.7); put(shimmer(0.4), 17.24, 0.7)                             # script dropped in
put(riser(1.0), 11.0, 0.5); put(riser(1.1), 18.35, 0.35); put(shimmer(1.0), 18.45, 1.2)   # flash to white, generating
for k in range(10): put(flip(), 20.3 + k * 0.02, 0.3, -0.5 + k * 0.1)                  # collage lands
for k, tt in enumerate((25.12, 25.2, 25.28)): put(chime([88 + 4 * k], 0.3, 0.1), tt, 1.0, -0.2 + 0.2 * k)
put(noise_whoosh(0.6, 500, 3000, 0.5), 27.8, 0.8); put(thud(0.7), 28.35, 0.8)          # folder rises
put(tap(), 29.47, 0.6); put(flip(), 29.85, 0.7)
for k, tt in enumerate((29.95, 30.03, 30.11)): put(chime([84 + 3 * k], 0.3, 0.12), tt, 1.0, (-0.3, 0.0, 0.3)[k])
put(boom(), 31.0, 1.0); put(shimmer(0.8), 31.05, 1.0)
for k in range(10): put(tap(), 31.35 + k * 0.03, 0.22, 0.2)

# ---------------- master ----------------
GAIN = dict(kick=1.0, bass=1.0, clap=0.5, hat=0.35, keys=1.8, fx=0.9)

def room(x, dur=0.9, mix=0.22, seed=3):
    """small plate: convolve with decaying stereo noise (FFT), keeps the dry signal"""
    n = int(dur * SR); t = np.arange(n) / SR; g = np.random.default_rng(seed)
    ir = g.standard_normal(n) * np.exp(-t / (dur / 5)); ir = biquad(ir, 'lp', 5000); ir /= np.sqrt(np.sum(ir ** 2))
    m = 1 << int(np.ceil(np.log2(len(x) + n)))
    wet = np.fft.irfft(np.fft.rfft(x, m) * np.fft.rfft(ir, m), m)[:len(x)]
    return x + wet * mix

for k in ('keys', 'fx', 'clap'):
    if k in STEMS: STEMS[k] = tuple(room(c, 0.9 if k != 'clap' else 0.5, 0.25 if k == 'keys' else 0.15, i) for i, c in enumerate(STEMS[k]))
# duck keys and bass a little under every kick (pumping glue)
kenv = np.abs(STEMS['kick'][0]); w = int(0.06 * SR)
kenv = np.convolve(kenv, np.ones(w) / w, 'same'); kenv = 1 - 0.45 * (kenv / kenv.max())
for k in ('keys', 'bass'): STEMS[k] = tuple(c * kenv for c in STEMS[k])
for k, (l, r) in STEMS.items(): print(f'{k:5s} rms {20*np.log10(np.sqrt(np.mean(l**2+r**2))+1e-9):6.1f} dB  peak {np.abs(l).max():.2f}')
mix = sum(np.stack(STEMS[k], 1) * GAIN[k] for k in STEMS)
# sidechain-ish duck of everything but kick isn't separable here; just glue + soft clip
mix = np.tanh(mix * 0.9) * 0.95
fade = np.ones(N); fn = int(0.3 * SR); fade[-fn:] = np.linspace(1, 0, fn)
mix *= fade[:, None]
pcm = (mix / max(1e-9, np.abs(mix).max()) * 0.89 * 32767).astype(np.int16)
(D / 'work').mkdir(exist_ok=True)
with wave.open(str(D / 'work/audio.wav'), 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('wrote work/audio.wav', T, 's')
