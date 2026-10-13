"""Soundtrack for the TikTok spot — synthesised from scratch, no samples, no stock "epic trailer" cues.
120 BPM half-time hip-hop/house hybrid. The hook is muffled like a phone speaker and opens on the first
fix; the slow-mo tell gets a real tape-stop; the montage cuts land on every beat.
usage: python3 tools/music.py out/soundtrack.wav"""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault('DUR', '55')
from synth import *

PROG = ['Am', 'F', 'C', 'G']
def chord(t): return CH[PROG[int(max(0, t - 3) // BAR) % 4]]
def sub808(m, dur):
    n = int((dur + 0.1) * SR); t = np.arange(n) / SR
    f = mtof(m) * (1 + 1.0 * np.exp(-t * 40)); x = np.sin(2 * np.pi * np.cumsum(f) / SR)
    x = x + 0.5 * np.sin(2 * 2 * np.pi * np.cumsum(f) / SR)            # 2nd harmonic so it reads on phone speakers
    return np.tanh(x * 2.2) * env_adsr(n, 0.003, 0.15, 0.7, 0.08, dur) * 0.55
def bleep(f=1250):
    n = int(0.16 * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * t) * ((t < .05) | ((t > .08) & (t < .13)))) * 0.25 * np.exp(-t * 6)
def crackle(dur):
    n = int(dur * SR); x = np.zeros(n); idx = rng.integers(0, n, int(dur * 90)); x[idx] = rng.uniform(-1, 1, len(idx))
    return hp(lp(x, 6000), 1500) * 0.5 + lp(rng.standard_normal(n), 400) * 0.01
def stab(ch, dur=0.22):
    n = int((dur + .3) * SR); x = sum(supersaw(mtof(m + 12), n, 5, 0.012) for m in ch[:4]) / 4
    return hp(sweep_lp(x, 5000, 600, curve=.6), 200) * env_adsr(n, .002, .12, .25, .2, dur) * 0.5
def cut_hit():
    n = int(0.12 * SR); t = np.arange(n) / SR
    return (lp(rng.standard_normal(n), 1800) * np.exp(-t * 45) + np.sin(2 * np.pi * 120 * t) * np.exp(-t * 30)) * 0.5

TAPE = (41.0, 43.5)
HOOK_END, DROP = 3.0, 3.0

# ---------------------------------------------------------------- drums + bass (half-time groove)
for b in range(int(DUR / BEAT)):
    t = b * BEAT; bb = b % 8           # position in a two-bar phrase
    if 49.0 <= t < 52.0: continue      # CTA breath
    if t >= 54.5: continue
    kpat = bb in (0, 3, 4, 7) if t >= 43.5 or t < 41 else bb in (0, 4)
    if t >= 43.5 and t < 49: kpat = True             # montage: kick on every cut
    kg = 0.45 if 43.5 <= t < 49 else 0.6
    if kpat: add('drums', kick(kg), t)
    if bb in (2, 6): add('drums', clap(), t, 0.5, 0.05)
    for k in range(2):
        th = t + k * BEAT / 2 + (0.035 if k else 0)   # swung 8ths
        add('drums', hat(open_=(k == 1 and bb in (3, 7))), th, 0.3 if k == 0 else 0.22, 0.25 * (1 if k else -1))
    if t >= 43.5 and t < 49:
        for k in (1, 3): add('drums', hat(), t + k * BEAT / 4, 0.16, 0.35)
    if kpat or bb in (6,):
        root = chord(t)[0]; add('music', sub808(root - 12 + (7 if bb == 6 else 0), BEAT * 0.9), t, 0.32)
# chord stabs on the off-beats, pads under
for b in range(int(DUR / BEAT)):
    t = b * BEAT
    if 3 <= t < 41 or 43.5 <= t < 49:
        if b % 4 in (1,) or (b % 8 == 6): add('music', stab(chord(t)[1]), t + BEAT / 2, 0.55, 0.3 * np.sin(b))
for bar in range(int(DUR / BAR) + 1):
    t = bar * BAR + (1 if bar else 0)
    if t >= DUR - 0.5: break
    add('pad', pad(chord(t)[1], t, BAR, 2200, 0.5), t)
# tell #2 pluck line (17–29), tell #3 bells (29–41)
for b in range(int(DUR / (BEAT / 2))):
    t = b * BEAT / 2; ch = chord(t)[1]
    if 17 <= t < 29: add('music', pluck(ch[[0, 2, 4, 2, 3, 1, 4, 2][b % 8]] + 12, 0.14, 4200), t, 0.5, 0.4 * np.sin(b * 1.3))
    if 29 <= t < 41 and b % 2 == 0: add('music', bell(ch[(b // 2) % 5] + 12, 1.2), t, 0.45, 0.4 * np.sin(b * .7))

# ---------------------------------------------------------------- hook: phone-speaker filter that opens on the drop
mask = np.ones(N); i3 = int(HOOK_END * SR)
for k in ('drums', 'music', 'pad'):
    for c in (0, 1):
        x = busses[k][c]; head = lp(x[:i3 + SR], 650, 4)
        fade = np.clip((np.arange(i3 + SR) - (i3 - int(.04 * SR))) / (.04 * SR), 0, 1)
        x[:i3 + SR] = head * (1 - fade) + x[:i3 + SR] * fade
        x[:i3] *= 0.7
add('fx', crackle(3.0), 0, 0.6)
for tt in (0.45, 0.85, 1.25, 1.65): add('fx', bleep(1250 if tt < 1 else 1500), tt, 0.5, rng.uniform(-.3, .3))
add('fx', riser(1.6), 1.4, 0.4); add('fx', reverse_swell(0.8), 2.2, 0.5)

# ---------------------------------------------------------------- tape stop on the slow-mo tell
a, b = int(TAPE[0] * SR), int(TAPE[1] * SR)
for k in ('drums', 'music', 'pad'):
    for c in (0, 1):
        x = busses[k][c]; n = b - a; u = np.arange(n) / n
        rate = 1 - 0.88 * np.minimum(1, u * 1.6) ** 0.8                  # 1.0 -> 0.12
        pos = a + np.cumsum(rate)
        y = np.interp(pos, np.arange(len(x)), x)
        y = lp(y, 9000) * (1 - 0.35 * u)
        x[a:b] = y
add('fx', whoosh(0.6), TAPE[1] - 0.3, 0.6)
add('fx', riser(1.5), TAPE[1] - 1.5, 0.45); add('fx', reverse_swell(1.0), TAPE[1] - 1.0, 0.5)
add('pad', pad(CH['Am'][1], TAPE[0], TAPE[1] - TAPE[0], 900, 0.5), TAPE[0])

# ---------------------------------------------------------------- transitions, hits, UI
for c in (3.0, 5.0, 17.0, 29.0, 49.0):
    add('fx', hp(impact(), 45), c, 0.3 if c != 3.0 else 0.45)
    add('fx', whoosh(0.7), c - 0.35, 0.45, -0.4); add('fx', whoosh(0.7), c - 0.33, 0.45, 0.4)
add('fx', hp(impact(), 45), 43.5, 0.35)
for k in range(11): add('fx', cut_hit(), 43.5 + k * 0.5, 0.35, (-1) ** k * 0.3)
add('fx', hp(impact(), 45), 52.0, 0.4); add('fx', shimmer(CH['Am'][1], 3.0), 52.0, 0.5)
# UI sounds
UI = [5.25, 5.37, 5.49, 6.2, 6.45, 9.2, 12.3, 12.45, 20.1, 20.25, 20.4, 20.55, 20.7, 34.7, 36.0, 36.8, 37.6, 38.4, 43.5, 52.45, 52.9]
for t in UI: add('fx', tick(), t, 0.55, rng.uniform(-.3, .3))
for k in range(12): add('fx', bleep(700 + k * 70) * 0.35, 9.75 + k * 0.095, 0.25)      # training blips
add('fx', shimmer(CH['C'][1], 2.0), 10.95, 0.45)                                        # "character locked"
# lens clicks as the focal length passes each detent (24 -> 85 between 21.6 and 25.8)
for mm in (29.5, 42.5, 67.5):
    u = (mm - 24) / 61; lo, hi = 0.0, 1.0
    for _ in range(40):
        m = (lo + hi) / 2; e = 4 * m ** 3 if m < .5 else 1 - (-2 * m + 2) ** 3 / 2
        lo, hi = (m, hi) if e < u else (lo, m)
    add('fx', tick(), 21.6 + lo * 4.2, 0.7)

# ---------------------------------------------------------------- mix (same chain as the reel)
def kick_env():
    e = np.zeros(N)
    for b in range(int(DUR / BEAT)):
        t = b * BEAT; i = int(t * SR); n = int(0.25 * SR); e[i:i + n] = np.maximum(e[i:i + n], np.exp(-np.arange(n) / SR * 10)[:len(e[i:i + n])])
    return e
duck = 1 - 0.4 * kick_env()
def reverb(x, sec=2.2, seed=0):
    r = np.random.default_rng(seed); n = int(sec * SR); t = np.arange(n) / SR
    ir = r.standard_normal(n) * np.exp(-t * 6.9 / sec); ir = lp(ir, 6000); ir[0] = 0
    return signal.fftconvolve(x, ir)[: len(x)] * 0.1
for k in ('music', 'pad'):
    busses[k][0] *= duck; busses[k][1] *= duck
mix = []
for c in (0, 1):
    m = busses['drums'][c] * 0.95 + busses['music'][c] * 0.8 + busses['pad'][c] * 0.6 + busses['fx'][c] * 0.8
    send = busses['music'][c] * 0.5 + busses['pad'][c] * 0.4 + busses['fx'][c] * 0.6
    m = m + reverb(send, 2.2, c + 1); m = hp(m, 30); m = m + 0.45 * hp(m, 2500) - 0.15 * bp(m, 160, 400)
    mix.append(m)
mixL, mixR = mix
tt = np.arange(N) / SR
fade = np.clip((DUR - tt) / 0.35, 0, 1)
mixL *= fade; mixR *= fade
peak = max(np.abs(mixL).max(), np.abs(mixR).max())
mixL, mixR = np.tanh(mixL / peak * 1.7) * 0.89, np.tanh(mixR / peak * 1.7) * 0.89
out = np.stack([mixL, mixR], 1)[: int(DUR * SR)]
wavfile.write(sys.argv[1] if len(sys.argv) > 1 else 'out/soundtrack.wav', SR, (out * 32767).astype(np.int16))
print('wrote', out.shape[0] / SR, 's')
