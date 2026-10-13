// Shared pieces for the spot: worlds (built once), camera rigs, native TikTok-style captions and pills.
import * as THREE from 'three';
import { desert, city, shore } from './world.js';
import { el, seg, E, clamp, lerp, show } from './lib.js';

let _w = null;
export const worlds = () => (_w ||= { desert: desert(), city: city(), shore: shore() });
export const cam = (fov = 38) => new THREE.PerspectiveCamera(fov, 1, 0.05, 600);

// smooth pseudo-noise for operated (handheld) cameras: sum of incommensurate sines
const n1 = (t, s) => Math.sin(t * 1.31 + s) * 0.5 + Math.sin(t * 2.77 + s * 2.1) * 0.3 + Math.sin(t * 5.93 + s * 3.7) * 0.2;
export function rig(c, pos, tgt, o = {}) {
  const t = o.t || 0, a = o.shake ?? 0;
  c.position.set(pos[0] + n1(t, 1) * 0.012 * a, pos[1] + n1(t, 2) * 0.01 * a, pos[2] + n1(t, 3) * 0.008 * a);
  c.up.set(0, 1, 0); c.lookAt(tgt[0] + n1(t, 4) * 0.02 * a, tgt[1] + n1(t, 5) * 0.016 * a, tgt[2]);
  c.rotateZ((o.roll || 0) + n1(t, 6) * 0.0025 * a);
  if (o.fov) c.fov = o.fov;
}
// the "AI" camera: weightless constant drift with a slow roll, no operator
export function floaty(c, base, tgt, t) {
  c.position.set(base[0] + t * 0.07, base[1] + t * 0.025, base[2] - t * 0.12); c.up.set(0, 1, 0); c.lookAt(tgt[0], tgt[1], tgt[2]); c.rotateZ(Math.sin(t * 0.45) * 0.035 + 0.01);
}
export function focalToFov(mm, aspect) { // vertical fov for a 36mm-wide sensor at the given aspect
  const sh = 36 / aspect; return 2 * Math.atan(sh / (2 * mm)) * 180 / Math.PI;
}
const _v = new THREE.Vector3();
export function proj(c, p, w, h) { _v.set(...p).project(c); return [(_v.x * .5 + .5) * w, (-_v.y * .5 + .5) * h]; }

// native caption: words pop in like TikTok auto-captions
export function caption(root, text, top, o = {}) {
  const d = el(root, '', { top: `${top}px` }); d.className = 'a cap';
  if (o.size) d.style.fontSize = o.size + 'px';
  d.innerHTML = text.split(' ').map(w => `<span class="w" style="display:inline-block;margin:0 .12em">${w}</span>`).join('<wbr>');
  d.words = [...d.querySelectorAll('.w')];
  d.run = (t, t0, t1 = null, rate = 0.075) => {
    const out = t1 == null ? 0 : E.in2(seg(t, t1, t1 + 0.12));
    d.words.forEach((w, i) => {
      const p = seg(t, t0 + i * rate, t0 + i * rate + 0.1);
      if (p <= 0 || out >= 1) { w.style.visibility = 'hidden'; return; }
      w.style.visibility = 'visible'; w.style.opacity = (1 - out).toFixed(3);
      w.style.transform = `scale(${(0.82 + 0.18 * E.outBack(p, 2.5)).toFixed(3)})`;
    });
  };
  return d;
}
export function pill(root, text, top, kind = 'tell') {
  const st = kind === 'tell' ? { background: '#ff3b30', color: '#fff' } : kind === 'fix' ? { background: '#fff', color: '#000' } : { background: 'rgba(0,0,0,.55)', color: '#fff', border: '1px solid rgba(255,255,255,.25)' };
  const d = el(root, text, { top: `${top}px`, left: '0', width: '1080px', textAlign: 'center' });
  d.innerHTML = `<span class="pill" style="background:${st.background};color:${st.color};${st.border ? 'border:' + st.border : ''}">${text}</span>`;
  d.run = (t, t0, t1 = null) => show(d, (t1 == null ? 1 : 1 - E.in2(seg(t, t1, t1 + .12))) * E.outBack(seg(t, t0, t0 + 0.18), 2), { y: 0, blur: 0, scale: 0.3 });
  return d;
}
export { el, seg, E, clamp, lerp, show };
