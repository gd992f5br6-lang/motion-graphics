// 0:17 Tell #2 — the weightless drifting camera. Fix: Cinema Studio — lens choice and stacked moves (a real dolly zoom).
import { worlds, cam, rig, floaty, focalToFov, caption, pill, el, seg, E, show, lerp } from '../kit.js';
const S = { name: 'tell2', dur: 12 };
let C, C2, capA, capB, pA, pB, panel, chips, focal, moves, sensor;
const VX = 60, VY = 420, VW = 960, VH = 540;
const LENSES = [24, 35, 50, 85];
S.init = (ctx) => {
  C = cam(); C2 = cam();
  const r = ctx.root;
  pA = pill(r, 'TELL #2', 160, 'tell'); capA = caption(r, 'The camera just… floats.', 230, { size: 74 });
  pB = pill(r, 'FIX #2', 160, 'fix'); capB = caption(r, 'Real lenses. Real camera moves.', 230, { size: 66 });
  panel = el(r, `<div style="display:flex;justify-content:space-between;align-items:baseline"><div style="font:800 44px 'TikTok Sans'">Cinema Studio</div><div class="sensor" style="font:600 22px 'JetBrains Mono';color:rgba(255,255,255,.55);letter-spacing:.12em">LARGE FORMAT</div></div>
    <div style="display:flex;align-items:flex-end;justify-content:space-between;margin-top:26px">
      <div><div style="font:600 20px 'JetBrains Mono';letter-spacing:.16em;color:rgba(255,255,255,.5)">FOCAL LENGTH</div><div class="focal" style="font:800 120px/1 'TikTok Sans';letter-spacing:-.04em;margin-top:8px">24<span style="font-size:52px;margin-left:6px;color:rgba(255,255,255,.6)">mm</span></div></div>
      <div class="chips" style="display:flex;gap:10px">${LENSES.map(l => `<div class="c" style="font:700 28px 'TikTok Sans';padding:14px 18px;border-radius:16px;border:1px solid rgba(255,255,255,.18)">${l}</div>`).join('')}</div>
    </div>
    <div style="font:600 20px 'JetBrains Mono';letter-spacing:.16em;color:rgba(255,255,255,.5);margin-top:34px">CAMERA MOVES · STACKED</div>
    <div class="moves" style="display:flex;gap:12px;align-items:center;margin-top:14px;font:700 30px 'TikTok Sans'">
      <div class="m" style="padding:14px 22px;border-radius:40px;background:rgba(255,255,255,.1)">Dolly out</div><div class="m" style="opacity:.5">+</div>
      <div class="m" style="padding:14px 22px;border-radius:40px;background:rgba(255,255,255,.1)">Zoom in</div><div class="m" style="opacity:.5">=</div>
      <div class="m" style="padding:14px 22px;border-radius:40px;background:#fff;color:#000">Dolly zoom</div></div>`,
    { left: '60px', top: '1000px', width: '880px', padding: '40px 40px', whiteSpace: 'normal' });
  panel.className = 'a panel';
  chips = [...panel.querySelectorAll('.c')]; focal = panel.querySelector('.focal'); moves = [...panel.querySelectorAll('.m')]; sensor = panel.querySelector('.sensor');
};
S.update = (t, ctx) => {
  const W = worlds();
  if (t < 3) {
    W.city.update(t + 20);
    floaty(C, [-0.3, 1.0, 1.0], [0.35, 1.5, -12], t + 1);
    C.fov = 40;
    ctx.place(ctx.shot('full', W.city.scene, C, 1080, 1920, { ai: 1, warp: 0.5, bloom: [1.0, 0.8, 0.5] }), 0, 0, 1080, 1920);
    show(panel, 0, {});
  } else {
    const w = W.desert; w.update(t + 30);
    const a = VW / VH;
    const u = E.io3(seg(t, 4.6, 8.8));
    const mm = lerp(24, 85, u);
    const fov = focalToFov(mm, a), fov0 = focalToFov(24, a);
    const d0 = 3.6, d = d0 * Math.tan(fov0 * Math.PI / 360) / Math.tan(fov * Math.PI / 360);
    const fz = w.fig.position.z, fx = w.fig.position.x;
    const after = E.ioSine(seg(t, 9.2, 12));
    rig(C2, [fx + 0.15 + after * 0.5, 0.95, fz + d], [fx + after * 0.25, 1.0, fz - 10], { t: t + 40, shake: 0.7, fov });
    const p = E.out4(seg(t, 3.0, 3.45));
    ctx.place(ctx.shot('view', w.scene, C2, VW, VH, {}), VX, VY + (1 - p) * 60, VW, VH, { radius: 28, opacity: p });
    show(panel, E.out4(seg(t, 3.25, 3.75)), { y: 80, blur: 0 });
    focal.firstChild.nodeValue = String(Math.round(mm));
    const ai = LENSES.reduce((b, l, i) => Math.abs(l - mm) < Math.abs(LENSES[b] - mm) ? i : b, 0);
    chips.forEach((c, i) => { const on = i === ai; c.style.background = on ? '#fff' : 'transparent'; c.style.color = on ? '#000' : '#fff'; });
    moves.forEach((m, i) => show(m, E.outBack(seg(t, 3.9 + i * 0.14, 4.1 + i * 0.14), 1.8), { y: 0, blur: 0, scale: 0.4 }));
  }
  pA.run(t, 0, 2.9); capA.run(t, 0.05, 2.9);
  pB.run(t, 3.05); capB.run(t, 3.1);
};
export default S;
