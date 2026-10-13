// 0:41 Tell #4 — everything in slow motion. Fix: real-time motion, cut on the beat (hard cuts every beat).
import { worlds, cam, rig, floaty, caption, pill, el, seg, E, show, lerp, LIME } from '../kit.js';
const S = { name: 'tell4', dur: 8 };
let C, capA, capB, pA, pB, strip, blocks, head;
const CUT0 = 2.5, BEAT = 0.5;
const SHOTS = [
  ['city', [0.62, 0.35, -4.7], [0.35, 1.62, -6.6], 30], ['desert', [0.4, 0.6, 2.5], [0, 1.4, -12], 46], ['shore', [0.45, 0.8, -3.0], [-0.3, 1.25, -6], 28],
  ['city', [-1.5, 1.6, 1.5], [0.3, 1.5, -8], 42], ['desert', [2.0, 1.0, 9], [-0.35, 1.0, -6.5], 9], ['shore', [0.0, 0.22, 0.4], [0, 0.9, -10], 44],
  ['city', [-0.45, 1.3, -4.1], [0.35, 1.45, -6.6], 26], ['desert', [2.6, 0.9, -6.1], [-0.35, 1.1, -6.5], 30], ['shore', [1.0, 1.0, 6], [-0.3, 1.0, -6], 11],
  ['city', [0.1, 1.0, -2.6], [0.35, 1.2, -6.6], 36], ['desert', [0.3, 0.75, 1.0], [0, 1.55, -12], 38],
];
S.init = (ctx) => {
  C = cam();
  const r = ctx.root;
  pA = pill(r, 'TELL #4', 160, 'tell'); capA = caption(r, 'Everything moves in slow-mo.', 230, { size: 74 });
  pB = pill(r, 'FIX #4', 160, 'fix'); capB = caption(r, 'Set the tempo. Real-time motion, cut on the beat.', 230, { size: 60 });
  strip = el(r, `<div style="display:flex;justify-content:space-between;font:600 20px 'JetBrains Mono';letter-spacing:.14em;color:rgba(255,255,255,.6)"><span>TEMPO · <span style="color:${LIME}">ON THE BEAT</span> · 120 BPM</span><span class="tc">00:00</span></div>
    <div class="track" style="position:relative;display:flex;gap:6px;margin-top:16px;height:70px">${SHOTS.map(() => '<div class="b" style="flex:1;border-radius:10px;background:rgba(255,255,255,.14)"></div>').join('')}
    <div class="head" style="position:absolute;top:-10px;width:4px;height:90px;background:#fff;border-radius:2px;box-shadow:0 0 12px rgba(255,255,255,.6)"></div></div>`,
    { left: '60px', top: '1370px', width: '880px', padding: '24px 40px 30px', whiteSpace: 'normal' });
  strip.className = 'a panel';
  blocks = [...strip.querySelectorAll('.b')]; head = strip.querySelector('.head'); strip.tc = strip.querySelector('.tc');
};
S.update = (t, ctx) => {
  const W = worlds();
  if (t < CUT0) {
    W.city.update(30 + t * 0.12, { speed: 1 });           // slow-motion rain
    floaty(C, [0.2, 0.9, 0.2], [0.35, 1.5, -10], t * 0.6); C.fov = 34;
    ctx.place(ctx.shot('full', W.city.scene, C, 1080, 1920, { ai: 0.85, warp: 0.4, bloom: [0.9, 0.8, 0.55] }), 0, 0, 1080, 1920);
    show(strip, 0, {});
  } else {
    const k = Math.min(SHOTS.length - 1, Math.floor((t - CUT0) / BEAT)), lt = t - CUT0 - k * BEAT;
    const [wn, pos, tgt, fov] = SHOTS[k], w = W[wn];
    w.update(40 + t, { speed: 1 });
    const push = 1 - 0.04 * lt;
    rig(C, [tgt[0] + (pos[0] - tgt[0]) * push, pos[1], tgt[2] + (pos[2] - tgt[2]) * push], tgt, { t: t * 1.6 + k, shake: 1.6, fov });
    ctx.place(ctx.shot('full', w.scene, C, 1080, 1920, { exposure: wn === 'shore' ? 0.85 : 1 }), 0, 0, 1080, 1920);
    show(strip, E.out4(seg(t, CUT0, CUT0 + 0.35)), { y: 60, blur: 0 });
    blocks.forEach((b, i) => { b.style.background = i === k ? LIME : i < k ? 'rgba(255,255,255,.4)' : 'rgba(255,255,255,.14)'; });
    const u = (t - CUT0) / (SHOTS.length * BEAT);
    head.style.left = `${(u * 800).toFixed(1)}px`;
    strip.tc.textContent = `00:${String(Math.floor(41 + t)).padStart(2, '0')}`;
  }
  pA.run(t, 0, 2.4); capA.run(t, 0.05, 2.4);
  pB.run(t, 2.55); capB.run(t, 2.6, null, 0.06);
};
export default S;
