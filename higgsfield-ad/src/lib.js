// Time helpers. Every frame is a pure function of t: no timers, no state between frames.
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, u) => a + (b - a) * u;
export const seg = (t, a, b) => clamp((t - a) / (b - a));
export const mix = (a, b, u) => Array.isArray(a) ? a.map((v, i) => lerp(v, b[i], u)) : lerp(a, b, u);
export const smooth = x => { x = clamp(x); return x * x * (3 - 2 * x); };
export const E = {
  lin: x => clamp(x),
  in2: x => clamp(x) ** 2,
  out2: x => 1 - (1 - clamp(x)) ** 2,
  in3: x => clamp(x) ** 3,
  out3: x => 1 - (1 - clamp(x)) ** 3,
  io3: x => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2; },
  out4: x => 1 - (1 - clamp(x)) ** 4,
  out5: x => 1 - (1 - clamp(x)) ** 5,
  io5: x => { x = clamp(x); return x < .5 ? 16 * x ** 5 : 1 - (-2 * x + 2) ** 5 / 2; },
  outExpo: x => { x = clamp(x); return x >= 1 ? 1 : 1 - 2 ** (-10 * x); },
  inExpo: x => { x = clamp(x); return x <= 0 ? 0 : 2 ** (10 * x - 10); },
  ioExpo: x => { x = clamp(x); return x <= 0 ? 0 : x >= 1 ? 1 : x < .5 ? 2 ** (20 * x - 10) / 2 : (2 - 2 ** (-20 * x + 10)) / 2; },
  outBack: (x, s = 1.4) => { x = clamp(x); return 1 + (s + 1) * (x - 1) ** 3 + s * (x - 1) ** 2; },
  ioSine: x => -(Math.cos(Math.PI * clamp(x)) - 1) / 2,
};
// closed-form spring step response 0 -> 1
export const spring = (tau, w = 14, z = 0.75) => {
  if (tau <= 0) return 0;
  if (z < 1) { const wd = w * Math.sqrt(1 - z * z); return 1 - Math.exp(-z * w * tau) * (Math.cos(wd * tau) + z * w / wd * Math.sin(wd * tau)); }
  return 1 - Math.exp(-w * tau) * (1 + w * tau);
};
// keyframes [[t, value, ease?], ...]: each segment eases from the previous key's value
export const kf = (keys, defEase = E.io3) => t => {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t1, v1, e] = keys[i];
    if (t < t1) { const [t0, v0] = keys[i - 1]; return mix(v0, v1, (e || defEase)((t - t0) / (t1 - t0))); }
  }
  return keys[keys.length - 1][1];
};
// deterministic pseudo-random
export const rnd = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
export const hash2 = (i, j) => rnd(i * 57.31 + j * 13.17);

// DOM helpers
export const el = (parent, html, style = {}) => {
  const d = document.createElement('div'); d.className = 'a'; d.innerHTML = html;
  Object.assign(d.style, style); parent.appendChild(d); return d;
};
// wrap each character of an element in a span; returns the spans
export const split = (node) => {
  const txt = node.textContent; node.textContent = '';
  return [...txt].map(c => { const s = document.createElement('span'); s.className = 'ch'; s.textContent = c; node.appendChild(s); return s; });
};
const fmt = v => v.toFixed(3);
// set an element's look from a progress value 0..1 (rise + blur + fade)
export const show = (node, p, o = {}) => {
  const { y = 40, x = 0, blur = 14, scale = 0, rot = 0, op = 1 } = o;
  if (p <= 0.0005) { node.style.opacity = 0; node.style.visibility = 'hidden'; return; }
  node.style.visibility = 'visible';
  node.style.opacity = fmt(clamp(p) * op);
  const q = 1 - p;
  node.style.transform = `translate(${fmt(x * q)}px,${fmt(y * q)}px) scale(${fmt(1 - scale * q)}) rotate(${fmt(rot * q)}deg)` + (o.extra || '');
  node.style.filter = blur * q > 0.05 ? `blur(${fmt(blur * q)}px)` : 'none';
};
// in/out envelope: rises over [a, a+din], falls over [b, b+dout]
export const env = (t, a, b, din = .6, dout = .4, ei = E.out4, eo = E.in2) => {
  const i = a == null ? 1 : ei(seg(t, a, a + din));
  const o = b == null ? 0 : eo(seg(t, b, b + dout));
  return i * (1 - o);
};
// staggered per-letter reveal
export const letters = (spans, t, t0, o = {}) => {
  const { stagger = .035, dur = .7, y = 60, blur = 16, ease = E.out4, out = null, outDur = .35, outStagger = .015, rot = 0 } = o;
  spans.forEach((s, i) => {
    let p = ease(seg(t, t0 + i * stagger, t0 + i * stagger + dur));
    if (out != null) p *= 1 - E.in3(seg(t, out + i * outStagger, out + i * outStagger + outDur));
    show(s, p, { y, blur, rot });
  });
};
export const setText = (node, s) => { if (node._t !== s) { node.textContent = s; node._t = s; } };
export const fmtNum = (v, dec = 0, sep = ',', dsep = '.') => {
  const s = Math.abs(v).toFixed(dec); let [i, d] = s.split('.');
  i = i.replace(/\B(?=(\d{3})+(?!\d))/g, sep);
  return (v < 0 ? '−' : '') + i + (d ? dsep + d : '');
};
