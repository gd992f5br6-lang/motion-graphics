// 0:05 Tell #1 — the character drifts between shots. Fix: Soul ID.
import { worlds, cam, rig, caption, pill, el, seg, E, show, lerp, LIME } from '../kit.js';
const S = { name: 'tell1', dur: 12 };
let C = [], capA, capB, pA, pB, panel, bar, pct, done, badges = [], labels = [];
const WX = 120, WW = 840, WH = 352, WY = [430, 812, 1194];
S.init = (ctx) => {
  C = [cam(), cam(), cam()];
  const r = ctx.root;
  pA = pill(r, 'TELL #1', 160, 'tell'); capA = caption(r, 'Your character changes every shot.', 230, { size: 66 });
  pB = pill(r, 'FIX #1', 160, 'fix'); capB = caption(r, 'Train Soul ID once. Same character, every shot.', 230, { size: 62 });
  for (let i = 0; i < 3; i++) labels.push(el(r, `SHOT ${i + 1}`, { left: `${WX + 22}px`, top: `${WY[i] + 20}px`, font: "600 20px 'JetBrains Mono'", letterSpacing: '.14em', padding: '7px 12px', borderRadius: '8px', background: 'rgba(0,0,0,.5)' }));
  for (let i = 0; i < 2; i++) badges.push(el(r, '', { left: '500px', top: `${WY[i] + WH - 26}px`, width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', font: "800 52px 'TikTok Sans'", boxShadow: '0 6px 20px rgba(0,0,0,.4)' }));
  // Soul ID panel
  const fig = worlds().desert.fig.material.map.image;
  const thumb = (bg, k) => `<div style="width:216px;height:216px;border-radius:20px;background:${bg};position:relative;overflow:hidden"><img src="${fig.toDataURL()}" style="position:absolute;left:${48 + k * 6}px;top:${14 - k * 4}px;width:${120 + k * 6}px;height:${240 + k * 12}px"></div>`;
  panel = el(r, `<div style="font:800 54px 'TikTok Sans';letter-spacing:-.02em">Soul ID</div>
    <div style="font:500 26px 'TikTok Sans';color:rgba(255,255,255,.6);margin-top:6px">5–20 reference photos · reusable in images and video</div>
    <div style="display:grid;grid-template-columns:repeat(3,216px);gap:16px;margin-top:30px">${['#d9895a', '#2a2140', '#c9a39a', '#9a4c63', '#3d4d5c', '#e8b07a'].map((b, k) => thumb(b, k % 3)).join('')}</div>
    <div style="margin-top:30px;height:14px;border-radius:7px;background:rgba(255,255,255,.12);overflow:hidden"><div class="bar" style="height:100%;width:0;background:${LIME};border-radius:7px"></div></div>
    <div style="display:flex;justify-content:space-between;margin-top:16px;font:600 26px 'TikTok Sans'"><span class="pct" style="color:rgba(255,255,255,.7)">Training… 0%</span><span class="done" style="color:${LIME};opacity:0">✓ Soul ID ready</span></div>`,
    { left: '110px', top: '600px', width: '760px', padding: '44px 50px', whiteSpace: 'normal' });
  panel.className = 'a panel';
  bar = panel.querySelector('.bar'); pct = panel.querySelector('.pct'); done = panel.querySelector('.done');
};
S.update = (t, ctx) => {
  const W = worlds(); const fixed = t >= 6.6;
  const set = [[W.desert, 'desert'], [W.city, 'city'], [W.shore, 'shore']];
  const panelIn = E.out4(seg(t, 4.2, 4.7)) * (1 - E.in3(seg(t, 6.4, 6.75)));
  set.forEach(([w, k], i) => {
    w.update(t + i * 1.7, { variant: fixed ? 0 : i });
    const tz = fixed ? E.ioSine(seg(t, 6.6, 12)) : E.ioSine(seg(t, 0, 6.6));
    const base = [[0.3, 0.8, 0.6], [0.0, 1.0, -1.2], [0.25, 0.85, 0.2]][i];
    rig(C[i], [base[0] + lerp(-0.25, 0.25, tz) * (i === 1 ? -1 : 1), base[1], base[2] - tz * 0.6], [w.fig.position.x, 1.05, w.fig.position.z], { t: t + i * 3, shake: 1, fov: 26 });
    const p = E.out4(seg(t, 0.15 + i * 0.12, 0.6 + i * 0.12)), p2 = E.out4(seg(t, 6.6 + i * 0.1, 7.0 + i * 0.1));
    const y = WY[i] + (1 - p) * 80 + (fixed ? (1 - p2) * 40 : 0);
    const tex = ctx.shot('w' + i, w.scene, C[i], WW, WH, { exposure: k === 'shore' ? 0.85 : 1, grain: 0.06 });
    ctx.place(tex, WX, y, WW, WH, { radius: 26, opacity: p * (fixed ? p2 : 1), dim: panelIn * 0.65 });
    show(labels[i], p * (1 - panelIn), { y: 0, blur: 0 });
    labels[i].innerHTML = fixed ? `SHOT ${i + 1} · <span style="color:${LIME}">SOUL ID</span>` : `SHOT ${i + 1}`;
  });
  badges.forEach((b, i) => {
    const on = fixed ? E.outBack(seg(t, 7.3 + i * 0.15, 7.5 + i * 0.15), 2.2) : E.outBack(seg(t, 1.2 + i * 0.25, 1.4 + i * 0.25), 2.2) * (1 - panelIn);
    b.textContent = fixed ? '=' : '≠'; b.style.background = fixed ? LIME : '#ff3b30'; b.style.color = fixed ? '#000' : '#fff';
    show(b, on, { y: 0, blur: 0, scale: 0.4 });
  });
  show(panel, panelIn, { y: 120, blur: 0 });
  const tr = E.io3(seg(t, 4.75, 5.9));
  bar.style.width = (tr * 100).toFixed(1) + '%'; pct.textContent = tr < 1 ? `Training… ${Math.round(tr * 100)}%` : 'Training… 100%';
  done.style.opacity = E.out3(seg(t, 5.95, 6.15)).toFixed(3);
  pA.run(t, 0.0, 4.15); capA.run(t, 0.05, 4.15);
  pB.run(t, 6.65); capB.run(t, 6.7);
};
export default S;
