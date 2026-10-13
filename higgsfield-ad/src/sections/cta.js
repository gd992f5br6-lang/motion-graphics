// 0:49 CTA — the clean hero frame, the claim, the brand. Ends on the opening composition so the loop is seamless.
import { worlds, cam, rig, el, seg, E, show, lerp } from '../kit.js';
const S = { name: 'cta', dur: 6 };
let C, l1, l2, word, chips, btn, veil;
S.init = (ctx) => {
  C = cam();
  const r = ctx.root;
  l1 = el(r, 'Cinematic.', { left: 0, width: '1080px', textAlign: 'center', top: '330px', font: "800 150px/1 'TikTok Sans'", letterSpacing: '-.045em', textShadow: '0 4px 30px rgba(0,0,0,.35)' });
  l2 = el(r, 'Not artificial.', { left: 0, width: '1080px', textAlign: 'center', top: '488px', font: "italic 400 158px/1 'Instrument Serif'", textShadow: '0 4px 30px rgba(0,0,0,.35)' });
  veil = el(r, '', { left: 0, top: 0, width: '1080px', height: '1920px', background: 'rgba(0,0,0,.55)' });
  word = el(r, 'higgsfield', { left: 0, width: '1080px', textAlign: 'center', top: '720px', font: "800 170px/1 'TikTok Sans'", letterSpacing: '-.055em' });
  chips = el(r, ['Soul ID', 'Cinema Studio', 'Image + Video'].map(c => `<span style="font:700 30px 'TikTok Sans';padding:14px 24px;border-radius:40px;border:1px solid rgba(255,255,255,.3);margin:0 7px">${c}</span>`).join(''), { left: 0, width: '1080px', textAlign: 'center', top: '940px' });
  btn = el(r, `<span style="display:inline-block;font:800 40px 'TikTok Sans';padding:26px 56px;border-radius:60px;background:#fff;color:#000">Try it → link in bio</span>`, { left: 0, width: '1080px', textAlign: 'center', top: '1090px' });
};
S.update = (t, ctx) => {
  const { desert } = worlds();
  desert.update(t + 70);
  const u = E.io3(seg(t, 0, 5.4));
  rig(C, [lerp(0.25, 0.1, u), lerp(0.75, 0.8, u), lerp(1.4, 1.6, u)], [0, 1.55, -12], { t: t + 80, shake: lerp(1, 0.3, u), fov: lerp(34, 38, u) });
  ctx.place(ctx.shot('full', desert.scene, C, 1080, 1920, {}), 0, 0, 1080, 1920);
  const out1 = E.in2(seg(t, 2.75, 2.95));
  show(l1, E.outBack(seg(t, 0.1, 0.26), 2) * (1 - out1), { y: 0, blur: 0, scale: 0.2 });
  show(l2, E.outBack(seg(t, 0.45, 0.61), 2) * (1 - out1), { y: 0, blur: 0, scale: 0.2 });
  const end = E.in2(seg(t, 5.55, 5.95));
  show(veil, E.out3(seg(t, 2.85, 3.2)) * (1 - end), { y: 0, blur: 0 });
  show(word, E.outBack(seg(t, 3.0, 3.2), 1.6) * (1 - end), { y: 0, blur: 0, scale: 0.15 });
  show(chips, E.out4(seg(t, 3.45, 3.75)) * (1 - end), { y: 20, blur: 0 });
  show(btn, E.outBack(seg(t, 3.9, 4.1), 2) * (1 - end), { y: 0, blur: 0, scale: 0.3 });
};
export default S;
