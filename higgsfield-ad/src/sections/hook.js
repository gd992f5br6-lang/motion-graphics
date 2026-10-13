// 0:00 Hook — the "typical AI video" frame, tagged with its tells, in the first second.
import { worlds, cam, floaty, proj, caption, el, seg, E, show } from '../kit.js';
const S = { name: 'hook', dur: 3 };
let C, cap1, cap2, tags = [];
S.init = (ctx) => {
  C = cam(38);
  cap1 = caption(ctx.root, 'You can spot an AI video in 1 second.', 200, { size: 84 });
  cap2 = caption(ctx.root, 'Here’s how to fix all 4.', 220, { size: 84 });
  const tag = (label) => { const d = el(ctx.root, `<div class="box" style="position:absolute;border:4px solid #ff3b30;border-radius:14px"></div><div class="lab" style="position:absolute;white-space:nowrap;font:800 30px 'TikTok Sans';background:#ff3b30;color:#fff;padding:8px 14px;border-radius:10px">${label}</div>`, { left: 0, top: 0 }); d.box = d.querySelector('.box'); d.lab = d.querySelector('.lab'); return d; };
  tags = ['warping edges', 'plastic glow', 'floaty camera', 'everything slow-mo'].map(tag);
};
const placeTag = (d, x, y, w, h, lx, ly) => { Object.assign(d.box.style, { left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${h}px` }); Object.assign(d.lab.style, { left: `${lx}px`, top: `${ly}px` }); };
S.update = (t, ctx) => {
  const { desert } = worlds();
  desert.update(t + 3.0, { speed: 0.35 });
  floaty(C, [0.1, 0.8, 1.6], [0, 1.55, -12], t); C.fov = 38;
  ctx.place(ctx.shot('full', desert.scene, C, 1080, 1920, { ai: 1, warp: 1.0, bloom: [1.1, 0.8, 0.55], exposure: 1.1 }), 0, 0, 1080, 1920);
  // tags follow what they point at
  const f = proj(C, [-0.35, 1.0, -6.5], 1080, 1920), sun = proj(C, [0.09 * 300, 0.075 * 300, -300], 1080, 1920);
  placeTag(tags[0], f[0] - 120, f[1] - 330, 240, 640, f[0] - 120, f[1] + 320);
  placeTag(tags[1], sun[0] - 110, sun[1] - 110, 220, 220, sun[0] - 110, sun[1] - 170);
  placeTag(tags[2], 90, 1420, 900, 110, 90, 1540);
  placeTag(tags[3], 640, 470, 330, 150, 640, 640);
  tags.forEach((d, i) => show(d, E.outBack(seg(t, 0.45 + i * 0.4, 0.6 + i * 0.4), 2) * (1 - seg(t, 2.25, 2.35)), { y: 0, blur: 0, scale: 0.25 }));
  cap1.run(t, 0, 2.2, 0);
  cap2.run(t, 2.35, null, 0.06);
};
export default S;
