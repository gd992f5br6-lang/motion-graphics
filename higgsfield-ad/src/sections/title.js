// 0:03 "4 tells. 4 fixes." — first clean, operated frame.
import { worlds, cam, rig, caption, pill, el, seg, E, show, lerp, LOGO } from '../kit.js';
const S = { name: 'title', dur: 2 };
let C, l1, l2, p;
S.init = (ctx) => {
  C = cam(38);
  l1 = el(ctx.root, '4 tells.', { left: 0, width: '1080px', textAlign: 'center', top: '330px', font: "800 150px/1 'TikTok Sans'", letterSpacing: '-.04em', textShadow: '0 4px 30px rgba(0,0,0,.4)' });
  l2 = el(ctx.root, '4 fixes.', { left: 0, width: '1080px', textAlign: 'center', top: '490px', font: "italic 400 170px/1 'Instrument Serif'", textShadow: '0 4px 30px rgba(0,0,0,.4)' });
  p = el(ctx.root, `<span style="display:inline-flex;align-items:center;gap:16px;padding:16px 28px;border-radius:50px;background:rgba(0,0,0,.6);backdrop-filter:blur(10px)"><span style="font:700 30px 'TikTok Sans';color:rgba(255,255,255,.8)">with</span><img src="${LOGO}" style="height:42px"></span>`, { left: 0, width: '1080px', textAlign: 'center', top: '700px' });
  p.run = (t, t0) => show(p, E.outBack(seg(t, t0, t0 + 0.2), 2), { y: 0, blur: 0, scale: 0.3 });
};
S.update = (t, ctx) => {
  const { desert } = worlds();
  desert.update(t + 6);
  rig(C, [lerp(0.3, 0.22, t / 2), 0.75, lerp(1.2, 0.6, E.out3(t / 2))], [0, 1.55, -12], { t: t + 10, shake: 1, fov: 38 });
  ctx.place(ctx.shot('full', desert.scene, C, 1080, 1920, {}), 0, 0, 1080, 1920);
  show(l1, E.outBack(seg(t, 0.0, 0.16), 2), { y: 0, blur: 0, scale: 0.2 });
  show(l2, E.outBack(seg(t, 0.25, 0.41), 2), { y: 0, blur: 0, scale: 0.2 });
  p.run(t, 0.6);
};
export default S;
