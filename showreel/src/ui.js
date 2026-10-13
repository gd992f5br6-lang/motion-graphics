// Overlay pieces shared by every chapter: the reel HUD and the chapter tag.
import { el, split, letters, show, seg, E, env } from './lib.js';

export function hud(root, o) {
  const fg = o.fg || '#fff', dim = o.dim || 'rgba(255,255,255,.55)';
  const box = el(root, '', { left: 0, top: 0, width: '1920px', height: '1080px' });
  const num = el(box, o.num, { left: '96px', top: '72px', font: '500 15px "JetBrains Mono"', color: fg, letterSpacing: '.12em' });
  const line = el(box, '', { left: '136px', top: '81px', height: '1px', width: '64px', background: dim, transformOrigin: '0 50%' });
  const cat = el(box, o.cat, { left: '216px', top: '72px', font: '500 15px "JetBrains Mono"', color: fg, letterSpacing: '.22em', textTransform: 'uppercase' });
  const catL = split(cat);
  const right = el(box, 'SHOWREEL&nbsp;&nbsp;/&nbsp;&nbsp;2026', { right: '96px', top: '72px', font: '500 15px "JetBrains Mono"', color: dim, letterSpacing: '.22em' });
  const prod = el(box, o.product, { left: '96px', bottom: '72px', font: '500 15px "JetBrains Mono"', color: dim, letterSpacing: '.22em', textTransform: 'uppercase' });
  const cnt = el(box, `${o.num}&nbsp;&nbsp;/&nbsp;&nbsp;05`, { right: '96px', bottom: '72px', font: '500 15px "JetBrains Mono"', color: dim, letterSpacing: '.22em' });
  const prog = el(box, '', { right: '96px', bottom: '62px', height: '1px', width: '150px', background: 'rgba(127,127,127,.35)' });
  const progF = el(prog, '', { left: 0, top: 0, height: '1px', width: '150px', background: o.accent || fg, transformOrigin: '0 50%' });
  return (t, dur) => {
    const out = dur - 0.45;
    const a = env(t, 0.25, out, 0.5, 0.3);
    show(num, a, { y: 0, x: -20, blur: 6 });
    line.style.transform = `scaleX(${E.out4(seg(t, 0.35, 1.1)) * (1 - E.in2(seg(t, out, out + .3)))})`;
    letters(catL, t, 0.45, { stagger: 0.018, dur: 0.5, y: 0, blur: 8, out, outDur: .25, outStagger: .004 });
    for (const n of [right, prod, cnt]) show(n, env(t, 0.6, out, 0.6, 0.3), { y: 0, blur: 6 });
    show(prog, env(t, 0.6, out, 0.6, 0.3), { y: 0, blur: 0 });
    progF.style.transform = `scaleX(${seg(t, 0, dur).toFixed(4)})`;
  };
}
