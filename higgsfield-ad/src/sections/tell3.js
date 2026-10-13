// 0:29 Tell #3 — plastic, over-cooked colour (A/B wipe). Fix: real sensor + film response, toggled live.
import { worlds, cam, rig, caption, pill, el, seg, E, show, lerp, LIME } from '../kit.js';
const S = { name: 'tell3', dur: 12 };
let C, capA, capB, pA, pB, labA, labB, knob, panel, rows;
const TOG = [['Color palette', '50+ looks · “Sodium Night”'], ['Era', '1970s · grain + lens character'], ['Halation', 'On'], ['Relight', 'Soft warm key']];
S.init = (ctx) => {
  C = cam();
  const r = ctx.root;
  pA = pill(r, 'TELL #3', 160, 'tell'); capA = caption(r, 'Plastic, over-cooked colour.', 230, { size: 74 });
  pB = pill(r, 'FIX #3', 160, 'fix'); capB = caption(r, 'Pick a palette and an era. Keep the grain.', 230, { size: 62 });
  labA = el(r, 'TYPICAL AI', { top: '520px', font: "800 30px 'TikTok Sans'", background: '#ff3b30', padding: '8px 14px', borderRadius: '10px' });
  labB = el(r, 'GRADED', { top: '520px', font: "800 30px 'TikTok Sans'", background: '#fff', color: '#000', padding: '8px 14px', borderRadius: '10px' });
  knob = el(r, '<svg width="64" height="64" viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#fff"/><path d="M24 22l-9 10 9 10M40 22l9 10-9 10" stroke="#000" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>', { top: '900px' });
  panel = el(r, `<div style="font:800 40px 'TikTok Sans';padding:18px 0 6px">Cinema Studio <span style="color:${LIME}">4.0</span> · Look</div>` + TOG.map(([k, v]) => `<div class="row" style="display:flex;align-items:center;justify-content:space-between;padding:22px 0;border-bottom:1px solid rgba(255,255,255,.08)">
      <div><div style="font:700 34px 'TikTok Sans'">${k}</div><div style="font:500 22px 'JetBrains Mono';color:rgba(255,255,255,.5);margin-top:4px">${v}</div></div>
      <div class="sw" style="width:96px;height:56px;border-radius:28px;background:rgba(255,255,255,.18);position:relative"><div class="k" style="position:absolute;top:6px;left:6px;width:44px;height:44px;border-radius:50%;background:#fff"></div></div></div>`).join(''),
    { left: '60px', top: '880px', width: '880px', padding: '20px 40px', whiteSpace: 'normal' });
  panel.className = 'a panel';
  rows = [...panel.querySelectorAll('.row')].map(r => ({ sw: r.querySelector('.sw'), k: r.querySelector('.k') }));
};
S.update = (t, ctx) => {
  const W = worlds();
  if (t < 5.5) {
    const w = W.shore; w.update(t + 50);
    rig(C, [0.1, 0.7, 0.6 - t * 0.05], [-0.1, 1.45, -12], { t: t + 50, shake: 1, fov: 36 });
    const sp = t < 1.0 ? lerp(1.0, 0.85, E.out3(t)) : t < 3.0 ? lerp(0.85, 0.18, E.io3(seg(t, 1.0, 2.6))) : lerp(0.18, 0.55, E.io3(seg(t, 3.0, 4.2)));
    ctx.place(ctx.shot('full', w.scene, C, 1080, 1920, { split: sp, exposure: 0.85, bloom: [0.6, 0.7, 0.7] }), 0, 0, 1080, 1920);
    const x = sp * 1080;
    show(labA, E.out3(seg(t, 0.4, 0.6)) * (1 - seg(t, 5.2, 5.4)), { y: 0, blur: 0 }); labA.style.left = `${Math.max(20, x - 230)}px`;
    show(labB, E.out3(seg(t, 0.4, 0.6)) * (1 - seg(t, 5.2, 5.4)), { y: 0, blur: 0 }); labB.style.left = `${Math.min(1080 - 180, x + 24)}px`;
    show(knob, E.out3(seg(t, 0.3, 0.5)) * (1 - seg(t, 5.2, 5.4)), { y: 0, blur: 0 }); knob.style.left = `${x - 32}px`;
    show(panel, 0, {});
  } else {
    const w = W.city; w.update(t + 60);
    rig(C, [lerp(-0.2, 0.15, E.ioSine(seg(t, 5.5, 12))), 0.85, 0.8], [0.35, 1.6, -12], { t: t + 60, shake: 1, fov: 34 });
    const on = TOG.map((_, i) => E.io3(seg(t, 7.0 + i * 0.8, 7.25 + i * 0.8)));
    ctx.place(ctx.shot('full', w.scene, C, 1080, 1920, {
      grain: 0.09 * on[1], halation: 1.0 * on[2], lift: 0.035 * on[1], sat: lerp(1.05, 0.9, on[0]), vign: 0.35 * on[0] + 0.1 * on[3], weave: on[1],
      bloom: [lerp(0.25, 0.5, on[2]), 0.6, 0.8], exposure: lerp(1.15, 1.0, on[0]) * lerp(1, 1.08, on[3]) }), 0, 0, 1080, 1920);
    show(panel, E.out4(seg(t, 5.7, 6.2)), { y: 80, blur: 0 });
    rows.forEach((r, i) => { r.k.style.left = `${6 + 40 * on[i]}px`; r.sw.style.background = on[i] > 0.5 ? LIME : 'rgba(255,255,255,.18)'; r.k.style.background = on[i] > 0.5 ? '#000' : '#fff'; });
    [labA, labB, knob].forEach(n => show(n, 0, {}));
  }
  pA.run(t, 0, 5.4); capA.run(t, 0.05, 5.4);
  pB.run(t, 5.55); capB.run(t, 5.6);
};
export default S;
