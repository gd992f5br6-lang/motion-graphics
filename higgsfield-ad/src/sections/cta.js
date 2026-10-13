// 0:49 CTA — the claim, every model in one workspace, the official mark. Ends on the opening composition (seamless loop).
import { worlds, cam, rig, el, seg, E, show, lerp, LIME, LOGO, caption } from '../kit.js';
const S = { name: 'cta', dur: 9 };
let C, l1, l2, veil, mcap, models, big, word, chips, btn, url;
const MODELS = ['Seedance 2.5', 'Kling 3.0', 'Veo 3.1', 'Soul 2.0', 'Nano Banana Pro', 'GPT Image 2.5', 'Flux 2.0', 'Wan 2.7', 'Cinema Studio 4.0'];
S.init = (ctx) => {
  C = cam();
  const r = ctx.root;
  l1 = el(r, 'Cinematic.', { left: 0, width: '1080px', textAlign: 'center', top: '330px', font: "800 150px/1 'TikTok Sans'", letterSpacing: '-.045em', textShadow: '0 4px 30px rgba(0,0,0,.35)' });
  l2 = el(r, 'Not artificial.', { left: 0, width: '1080px', textAlign: 'center', top: '488px', font: "italic 400 158px/1 'Instrument Serif'", textShadow: '0 4px 30px rgba(0,0,0,.35)' });
  veil = el(r, '', { left: 0, top: 0, width: '1080px', height: '1920px', background: 'rgba(0,0,0,.62)' });
  mcap = caption(r, 'Every top model. One workspace.', 300, { size: 70 });
  big = el(r, `<span style="color:${LIME}">30+</span> models`, { left: 0, width: '1080px', textAlign: 'center', top: '470px', font: "800 120px/1 'TikTok Sans'", letterSpacing: '-.04em' });
  models = el(r, MODELS.map(m => `<span class="m" style="display:inline-block;font:700 32px 'TikTok Sans';padding:16px 26px;border-radius:40px;margin:9px 7px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.18)">${m}</span>`).join(''),
    { left: '90px', width: '900px', textAlign: 'center', top: '660px', whiteSpace: 'normal' });
  models.items = [...models.querySelectorAll('.m')];
  word = el(r, `<img src="${LOGO}" style="width:820px">`, { left: '130px', top: '640px' });
  chips = el(r, ['Soul ID', 'Cinema Studio 4.0', '30+ models'].map(c => `<span style="font:700 30px 'TikTok Sans';padding:14px 24px;border-radius:40px;border:1px solid rgba(255,255,255,.3);margin:0 7px">${c}</span>`).join(''), { left: 0, width: '1080px', textAlign: 'center', top: '880px' });
  btn = el(r, `<span style="display:inline-block;font:800 42px 'TikTok Sans';padding:28px 60px;border-radius:60px;background:${LIME};color:#000">Create on higgsfield.ai</span>`, { left: 0, width: '1080px', textAlign: 'center', top: '1030px' });
  url = el(r, 'LINK IN BIO', { left: 0, width: '1080px', textAlign: 'center', top: '1170px', font: "600 24px 'JetBrains Mono'", letterSpacing: '.3em', color: 'rgba(255,255,255,.6)' });
};
S.update = (t, ctx) => {
  const { desert } = worlds();
  desert.update(t + 70);
  const u = E.io3(seg(t, 0, 8.4));
  rig(C, [lerp(0.25, 0.1, u), lerp(0.75, 0.8, u), lerp(1.4, 1.6, u)], [0, 1.55, -12], { t: t + 80, shake: lerp(1, 0.3, u), fov: lerp(34, 38, u) });
  ctx.place(ctx.shot('full', desert.scene, C, 1080, 1920, {}), 0, 0, 1080, 1920);
  const out1 = E.in2(seg(t, 2.45, 2.62));
  show(l1, E.outBack(seg(t, 0.1, 0.26), 2) * (1 - out1), { y: 0, blur: 0, scale: 0.2 });
  show(l2, E.outBack(seg(t, 0.45, 0.61), 2) * (1 - out1), { y: 0, blur: 0, scale: 0.2 });
  const end = E.in2(seg(t, 8.55, 8.95));
  show(veil, E.out3(seg(t, 2.55, 2.9)) * (1 - end), { y: 0, blur: 0 });
  // models beat
  const mOut = E.in2(seg(t, 5.25, 5.4));
  mcap.run(t, 2.65, 5.25, 0.06);
  show(big, E.outBack(seg(t, 2.9, 3.1), 2) * (1 - mOut), { y: 0, blur: 0, scale: 0.3 });
  models.items.forEach((m, i) => show(m, E.outBack(seg(t, 3.2 + i * 0.15, 3.38 + i * 0.15), 2) * (1 - mOut), { y: 0, blur: 0, scale: 0.4 }));
  show(models, 1, { y: 0, blur: 0 });
  // brand
  show(word, E.outBack(seg(t, 5.4, 5.62), 1.6) * (1 - end), { y: 0, blur: 0, scale: 0.15 });
  show(chips, E.out4(seg(t, 5.85, 6.15)) * (1 - end), { y: 20, blur: 0 });
  show(btn, E.outBack(seg(t, 6.3, 6.5), 2) * (1 - end), { y: 0, blur: 0, scale: 0.3 });
  show(url, E.out3(seg(t, 6.6, 6.9)) * (1 - end), { y: 10, blur: 0 });
};
export default S;
