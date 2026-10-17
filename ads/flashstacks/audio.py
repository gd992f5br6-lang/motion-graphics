"""Score + sound design for the ad, synthesised from scratch (no samples): python3 audio.py -> work/audio.wav
120 bpm, one bar = 2 s. Every hit sits on an event of the animation timeline (see ad.src.html)."""
import numpy as np, wave, pathlib

SR = 48000
T = 20.5
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

# ---------------- score ----------------
BEAT = 0.5; BAR = 2.0
# Ab major, vi-IV-I-V: Fm  Db  Ab  Eb (roots in MIDI, octave 1-2)
PROG = [(41, [65, 68, 72]), (37, [65, 68, 73]), (44, [63, 68, 72]), (39, [63, 67, 70])]
BREAK = (6.75, 7.5)  # tension before the lock-screen drop
END = 19.5

def in_break(t): return BREAK[0] <= t < BREAK[1]

bar_i = 0; t = 0.0
while t < END - 1e-6:
    root, chord = PROG[bar_i % 4]
    for e in range(8):  # eighths
        te = t + e * 0.25
        if te >= END or in_break(te): continue
        if e in (0, 3, 5) and not (te < 2.4 and e == 5): put(kick(big=(te in (0.0, 7.5))), te, 0.95, stem='kick')
        if e in (2, 6) and te >= 1.0: put(clap(), te, 0.55, 0.05, stem='clap')
        if te >= 1.0: put(hat(open_=(e == 7)), te, 0.5 if e % 2 else 0.28, 0.25, stem='hat')
        if te >= 2.4 and e in (0, 3, 6):
            for m in chord: put(pluck(m, 0.55, 0.7), te, 0.75, (m - 68) / 12, stem='keys')
    # bass follows the kick
    for e, d in ((0, 0.7), (3, 0.45), (5, 0.7)):
        te = t + e * 0.25
        if te < END and not in_break(te): put(sub(root + 12, d), te, 0.9, stem='bass')
    t += BAR; bar_i += 1

# final chord rings out
for m in PROG[0][1] + [PROG[0][1][0] + 12]: put(pluck(m, 1.6, 0.9), END, 0.9, (m - 68) / 14, stem='keys')
put(kick(True), END, 0.9); put(sub(41 + 12, 0.9), END, 0.9)

# ---------------- sound design on the animation ----------------
put(kick(True), 0.0, 0.6)                     # hook lands with an extra hit
put(slap(), 0.52, 0.9, -0.1)                  # card slapped onto the poster
TS = dict(s2=2.4, s3=4.9, s4=7.25, s5=12.85, s6=16.85)
for k in ('s2', 's3', 's5', 's6'): put(noise_whoosh(), TS[k] - 0.05, 0.75, 0.2)
for k in range(7): put(thud(0.9 + 0.05 * (k % 3)), TS['s2'] + 0.35 + k * 0.25 + 0.11, 0.8, (-0.4, 0.4)[k % 2])
put(thud(0.75), 4.65 + 0.11, 1.0)             # the one card lands on the pile
put(flip(), TS['s3'] + 0.2, 0.6)              # pile squares up into a stack
put(riser(0.75), BREAK[0], 0.55)              # into the lock screen
put(noise_whoosh(0.5, 3000, 300, 0.6), 7.2, 0.8)
for tt in (8.7, 9.9, 10.8, 11.8, 18.9): put(tap(), tt, 0.9, 0.15)
for tt in (8.75, 9.95, 10.85): put(flip(), tt, 0.9, -0.1)
put(chime([88, 95]), 9.92, 1.0)               # "Gewusst"
put(chime([83, 79], gap=0.09), 11.82, 0.9)    # "Nochmal"
put(noise_whoosh(0.6, 900, 4000, 0.3), TS['s5'] + 0.35, 0.7)   # bar draws
for k, tt in enumerate((14.0, 14.5, 15.0, 15.5)):
    put(chime([84 + (0, 4, 7, 12)[k]], 0.35, 0.16), tt + 0.05, 1.0, -0.3 + 0.2 * k)
put(chime([80, 84, 87, 92], 0.9, 0.16, 0.06), 18.92, 1.0)   # CTA

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
