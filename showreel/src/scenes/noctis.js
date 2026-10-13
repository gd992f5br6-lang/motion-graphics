// 05 Media & Entertainment — NOCTIS+ streaming
import * as THREE from 'three';
import { el, split, letters, show, env, seg, E, lerp, mix, rnd } from '../lib.js';
import { backdrop, canvasTex, roundRect, glowSprite, lookCam } from '../gl.js';
import { hud } from '../ui.js';

const ACC = '#c04dff', MAG = '#ff3d8b';
const S = { name: 'noctis', dur: 12, accent: ACC };
let scene, cam, tunnel = [], wall = [], hero, bd, H, ui = {}, flare, flare2;
const TITLES = ['THE LAST SIGNAL', 'NORTHBOUND', 'VELVET HOURS', 'ECHOES', 'SALTWATER', 'ORBIT', 'MIDNIGHT CITY', 'HOLLOW CROWN', 'AFTERGLOW', 'PARALLEL', 'WILD BLUE', 'NEON SAINTS',
  'STILL WATER', 'GHOST LIGHT', 'SUMMIT', 'RED HARVEST', 'LUNAR', 'THE QUIET', 'GOLDEN HOUR', 'DEEP FIELD', 'BLACKOUT', 'PALE FIRE', 'SIGNAL LOST', 'TIDES'];
const PAL = [['#0b1d3a', '#ff7a3d', '#ffd29a'], ['#14061f', '#c04dff', '#ff3d8b'], ['#1a0505', '#e8372c', '#ffb199'], ['#04121a', '#19c3c9', '#d9fff6'],
  ['#120c02', '#f2b134', '#fff1c7'], ['#0a0a12', '#6d7dff', '#e4e8ff'], ['#1c0b16', '#ff5fa2', '#ffe0ef'], ['#06140c', '#3ddc84', '#e6ffe9']];

function poster(i) {
  const [c0, c1, c2] = PAL[i % PAL.length], style = i % 6, title = TITLES[i % TITLES.length];
  return canvasTex(512, 768, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, c1); gr.addColorStop(.5, c0); gr.addColorStop(1, '#020203'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.save();
    if (style === 0) { // sun over ridges
      const sky = g.createLinearGradient(0, 0, 0, h * .7); sky.addColorStop(0, c0); sky.addColorStop(1, c1); g.fillStyle = sky; g.fillRect(0, 0, w, h * .7);
      g.fillStyle = c2; g.beginPath(); g.arc(w / 2, h * .48, 110, 0, 7); g.fill();
      for (let k = 0; k < 3; k++) { g.fillStyle = `rgba(0,0,0,${.45 + k * .2})`; g.beginPath(); g.moveTo(0, h); for (let x = 0; x <= w; x += 8) g.lineTo(x, h * (.55 + k * .07) - Math.abs(Math.sin(x * .012 + k * 2 + i)) * 90); g.lineTo(w, h); g.fill(); }
    } else if (style === 1) { // neon geometry
      g.fillStyle = '#05030a'; g.fillRect(0, 0, w, h); g.shadowColor = c1; g.shadowBlur = 30; g.strokeStyle = c1; g.lineWidth = 8;
      g.beginPath(); g.arc(w / 2, h * .42, 150, 0, 7); g.stroke(); g.strokeStyle = c2; g.lineWidth = 5;
      g.beginPath(); g.moveTo(w / 2, h * .42 - 210); g.lineTo(w / 2 + 180, h * .42 + 110); g.lineTo(w / 2 - 180, h * .42 + 110); g.closePath(); g.stroke();
    } else if (style === 2) { // lone figure
      const sky = g.createRadialGradient(w / 2, h * .62, 10, w / 2, h * .62, h * .7); sky.addColorStop(0, c2); sky.addColorStop(.3, c1); sky.addColorStop(1, c0); g.fillStyle = sky; g.fillRect(0, 0, w, h);
      g.fillStyle = '#050505'; g.fillRect(0, h * .66, w, h); g.beginPath(); g.arc(w / 2, h * .555, 18, 0, 7); g.fill();
      g.beginPath(); g.moveTo(w / 2 - 22, h * .66); g.lineTo(w / 2 - 14, h * .575); g.lineTo(w / 2 + 14, h * .575); g.lineTo(w / 2 + 22, h * .66); g.fill();
    } else if (style === 3) { // type block
      g.fillStyle = c1; g.fillRect(0, 0, w, h); g.fillStyle = c0; g.fillRect(0, h * .58, w, h * .42);
      g.fillStyle = c2; g.font = '900 470px "Inter Tight"'; g.letterSpacing = '-20px'; g.fillText(title.replace('THE ', '')[0], 10, h * .58);
    } else if (style === 4) { // night sky + planet
      g.fillStyle = '#03040a'; g.fillRect(0, 0, w, h);
      for (let k = 0; k < 220; k++) { g.fillStyle = `rgba(255,255,255,${rnd(k + i * 300) * .8})`; g.fillRect(rnd(k * 3 + i) * w, rnd(k * 7 + i) * h, 2, 2); }
      const pg = g.createRadialGradient(w * .4, h * .36, 10, w / 2, h * .42, 170); pg.addColorStop(0, c2); pg.addColorStop(.6, c1); pg.addColorStop(1, c0); g.fillStyle = pg; g.beginPath(); g.arc(w / 2, h * .42, 160, 0, 7); g.fill();
      g.strokeStyle = c2; g.globalAlpha = .7; g.lineWidth = 6; g.beginPath(); g.ellipse(w / 2, h * .42, 250, 50, -0.3, 0, 7); g.stroke(); g.globalAlpha = 1;
    } else { // waves
      for (let k = 0; k < 7; k++) { g.fillStyle = k % 2 ? c1 : c0; g.globalAlpha = .35 + k * .09; g.beginPath(); g.moveTo(0, h); for (let x = 0; x <= w; x += 8) g.lineTo(x, h * (.3 + k * .07) + Math.sin(x * .02 + k + i) * 26); g.lineTo(w, h); g.fill(); }
      g.globalAlpha = 1;
    }
    g.restore();
    // title + badge
    const vg = g.createLinearGradient(0, h * .6, 0, h); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.85)'); g.fillStyle = vg; g.fillRect(0, h * .6, w, h * .4);
    g.strokeStyle = 'rgba(255,255,255,.16)'; g.lineWidth = 3; g.strokeRect(1.5, 1.5, w - 3, h - 3);
    g.fillStyle = 'rgba(255,255,255,.93)'; g.font = '700 22px "Inter Tight"'; g.letterSpacing = '6px'; g.fillText('N+  ORIGINAL', 34, 56);
    const words = title.split(' '); g.letterSpacing = '0px';
    const serif = i % 3 === 1;
    g.font = serif ? 'italic 400 84px "Instrument Serif"' : '800 64px "Inter Tight"';
    words.forEach((wd, k) => g.fillText(serif ? wd.charAt(0) + wd.slice(1).toLowerCase() : wd, 34, h - 60 - (words.length - 1 - k) * (serif ? 76 : 62)));
  });
}

S.init = (ctx) => {
  scene = new THREE.Scene();
  scene.fog = new THREE.Fog('#020104', 5, 24);
  bd = backdrop({ c0: '#020104', c1: '#2a0b3d', g1: [0.5, 0.5, 0.0, 0], c2: '#3d0620', g2: [0.5, 0.5, 0.0, 0] });
  scene.add(bd);
  cam = new THREE.PerspectiveCamera(40, 16 / 9, 0.05, 100);
  const texs = TITLES.map((_, i) => poster(i));
  const pg = new THREE.PlaneGeometry(1.4, 2.1);
  // tunnel: rings of posters around the flight path
  for (let ring = 0; ring < 13; ring++) for (let k = 0; k < 9; k++) {
    const a = k / 9 * Math.PI * 2 + ring * 0.35, R = 3.0;
    const m = new THREE.Mesh(pg, new THREE.MeshBasicMaterial({ map: texs[(ring * 9 + k) % 24], side: THREE.DoubleSide }));
    m.position.set(Math.cos(a) * R, Math.sin(a) * R, -ring * 2.3);
    m.lookAt(0, 0, m.position.z); m.rotateZ(rnd(ring * 9 + k) * 0.2 - 0.1);
    scene.add(m); tunnel.push(m);
  }
  // wall: 9 x 3 grid
  for (let r = 0; r < 3; r++) for (let c = 0; c < 9; c++) {
    const i = r * 9 + c;
    const m = new THREE.Mesh(pg, new THREE.MeshBasicMaterial({ map: texs[(i * 7 + 3) % 24], transparent: true }));
    m.grid = [(c - 4) * 1.62, (1 - r) * 2.35, 0]; m.from = [(rnd(i) - .5) * 14, (rnd(i + 50) - .5) * 9, -8 - rnd(i + 9) * 8]; m.delay = rnd(i + 77) * 0.5;
    scene.add(m); wall.push(m);
  }
  hero = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 2.1), new THREE.MeshBasicMaterial({ map: texs[0], transparent: true }));
  scene.add(hero);
  flare = glowSprite('#d9a6ff', 3.2, { intensity: 1.2, core: 0.04 }); flare.position.set(0, 0.35, -2); scene.add(flare);
  flare2 = glowSprite(MAG, 1.6, { intensity: 1.0 }); flare2.position.set(0, 0.35, -1.9); scene.add(flare2);

  // ---- overlay
  const r = ctx.root;
  H = hud(r, { num: '05', cat: 'Media & Entertainment', product: 'NOCTIS+ · Streaming', accent: ACC });
  ui.shade = el(r, '', { left: 0, top: 0, width: '1920px', height: '1080px', background: 'radial-gradient(ellipse 60% 70% at 12% 78%, rgba(2,1,4,.85), rgba(2,1,4,0) 70%)' });
  ui.shade2 = el(r, '', { left: 0, top: 0, width: '1920px', height: '1080px', background: 'linear-gradient(90deg, rgba(2,1,4,.92) 0%, rgba(2,1,4,.75) 38%, rgba(2,1,4,0) 62%)' });
  ui.l1 = el(r, 'Your next', { left: '96px', top: '690px', font: '800 124px/1 "Inter Tight"', letterSpacing: '-.04em' });
  ui.l2 = el(r, 'obsession.', { left: '96px', top: '806px', font: 'italic 400 150px/1 "Instrument Serif"', letterSpacing: '-.01em', color: '#ff7ab8' });
  ui.l1L = split(ui.l1); ui.l2L = split(ui.l2);
  ui.info = el(r, `<div style="font:500 15px 'JetBrains Mono';letter-spacing:.24em;color:#ff7ab8">N+ ORIGINAL SERIES&nbsp;&nbsp;·&nbsp;&nbsp;SEASON 2</div>
    <div style="font:800 118px/0.95 'Inter Tight';letter-spacing:-.045em;margin-top:22px">THE LAST<br>SIGNAL</div>
    <div style="font:400 22px 'Inter Tight';color:rgba(255,255,255,.7);margin-top:26px;width:560px;white-space:normal;line-height:1.45">A radio operator on a remote island picks up a voice that shouldn’t exist.</div>
    <div style="display:flex;gap:14px;margin-top:34px">
      <div style="display:flex;align-items:center;gap:12px;padding:16px 34px;border-radius:40px;background:#fff;color:#0a0510;font:700 21px 'Inter Tight'"><svg width="18" height="18" viewBox="0 0 24 24"><path d="M6 4l15 8-15 8z" fill="#0a0510"/></svg>Play S2 · E1</div>
      <div style="padding:16px 30px;border-radius:40px;border:1px solid rgba(255,255,255,.35);font:600 21px 'Inter Tight'">＋ My List</div>
    </div>
    <div style="display:flex;gap:18px;margin-top:30px;font:500 15px 'JetBrains Mono';letter-spacing:.14em;color:rgba(255,255,255,.55)"><span style="color:#7dffb0">98% MATCH</span><span>2026</span><span>4K · DOLBY VISION</span><span>16+</span></div>`,
    { left: '150px', top: '300px' });
  ui.rays = el(r, '', { left: '160px', top: '-400px', width: '1600px', height: '1600px', borderRadius: '50%', mixBlendMode: 'screen',
    background: 'repeating-conic-gradient(from 0deg, rgba(200,140,255,.0) 0deg, rgba(200,140,255,.22) 3deg, rgba(200,140,255,0) 7deg, rgba(255,80,160,0) 11deg, rgba(255,90,170,.14) 13deg, rgba(255,80,160,0) 17deg)',
    WebkitMaskImage: 'radial-gradient(circle, rgba(0,0,0,1) 0%, rgba(0,0,0,.6) 25%, rgba(0,0,0,0) 62%)', maskImage: 'radial-gradient(circle, rgba(0,0,0,1) 0%, rgba(0,0,0,.6) 25%, rgba(0,0,0,0) 62%)', filter: 'blur(6px)' });
  ui.word = el(r, 'NOCTIS<span style="color:#ff5fa2">+</span>', { left: 0, width: '1920px', textAlign: 'center', top: '388px', font: '800 210px/1 "Inter Tight"', letterSpacing: '-.04em', textShadow: '0 0 60px rgba(192,77,255,.55)' });
  ui.tag = el(r, 'Stories without limits.', { left: 0, width: '1920px', textAlign: 'center', top: '640px', font: 'italic 400 58px "Instrument Serif"', color: 'rgba(255,255,255,.88)' });
  ui.tagL = split(ui.tag);
  ui.now = el(r, 'NOW STREAMING&nbsp;&nbsp;·&nbsp;&nbsp;4K HDR&nbsp;&nbsp;·&nbsp;&nbsp;SPATIAL AUDIO', { left: 0, width: '1920px', textAlign: 'center', top: '760px', font: '500 15px "JetBrains Mono"', letterSpacing: '.4em', textIndent: '.4em', color: 'rgba(255,255,255,.55)' });
};

S.update = (t) => {
  const d = S.dur;
  const inTunnel = t < 4.6;
  tunnel.forEach(m => m.visible = inTunnel);
  wall.forEach(m => m.visible = !inTunnel && t < 10.2);
  hero.visible = !inTunnel && t < 10.2;
  let rays = 0;
  if (inTunnel) {
    const u = seg(t, 0, 4.6);
    const z = lerp(3.0, -15.5, E.ioSine(u) * 0.35 + u * 0.65);
    cam.position.set(Math.sin(t * 0.7) * 0.35, Math.cos(t * 0.5) * 0.25, z);
    cam.up.set(Math.sin(t * 0.18), Math.cos(t * 0.18), 0);
    cam.lookAt(Math.sin(t * 0.7 + 0.6) * 0.5, 0, z - 6);
    cam.fov = 46;
    bd.u.g1.value.set(0.5, 0.5, 0.25, 0.8);
  } else {
    // wall assembles, hero card pulls forward
    const u = E.ioSine(seg(t, 4.6, 10));
    lookCam(cam, [lerp(1.2, -0.6, u), lerp(0.25, 0.1, u), lerp(9.2, 8.4, u)], [lerp(0.3, 0, u), 0, 0]);
    cam.fov = 40;
    const pull = E.io5(seg(t, 5.6, 6.6)), fade = E.io3(seg(t, 8.4, 9.4));
    wall.forEach((m, i) => {
      const p = E.out4(seg(t, 4.6 + m.delay * 0.8, 5.8 + m.delay * 0.8));
      m.position.set(...mix(m.from, m.grid, p)); m.position.z -= pull * 1.4 + fade * 3;
      m.rotation.set(0, (1 - p) * 1.2 * (rnd(i) - .5), (1 - p) * 0.6 * (rnd(i + 2) - .5));
      m.material.opacity = (1 - pull * 0.8) * (1 - fade) * Math.min(1, p * 1.5);
    });
    hero.position.set(lerp(0, 2.35, pull), lerp(0, 0.05, pull), lerp(0, 3.2, pull) - fade * 2.5);
    hero.rotation.set(0, lerp(0, -0.16, pull), 0);
    hero.scale.setScalar(lerp(1, 1.18, pull));
    hero.material.opacity = Math.min(1, E.out4(seg(t, 4.6, 5.8)) * 1.5) * (1 - fade);
    rays = E.out3(seg(t, 9.0, 10.4));
    bd.u.g1.value.set(0.5, 0.55, lerp(0.0001, 0.3, rays), rays * 0.7);
  }
  cam.updateProjectionMatrix();
  flare.visible = flare2.visible = rays > 0.001;
  flare.material.opacity = rays * 0.55; flare2.material.opacity = rays * (0.6 + 0.15 * Math.sin(t * 9));
  flare.position.set(0, 0.55, 0); flare2.position.set(0, 0.55, 0.1);

  // ---- overlay
  H(t, d);
  letters(ui.l1L, t, 0.55, { stagger: .03, dur: .8, y: 70, blur: 20, out: 4.0, outDur: .3, outStagger: .01 });
  letters(ui.l2L, t, 0.95, { stagger: .035, dur: .9, y: 70, blur: 20, out: 4.05, outDur: .3, outStagger: .01 });
  show(ui.info, env(t, 6.1, 8.3, .9, .4), { x: -50, y: 0, blur: 16 });
  show(ui.shade, env(t, 0.2, 4.0, .6, .4), { y: 0, blur: 0 });
  show(ui.shade2, env(t, 5.7, 8.6, .9, .6), { y: 0, blur: 0 });
  show(ui.rays, rays * (1 - E.in2(seg(t, 11.4, 11.9))), { y: 0, blur: 0, scale: 0.3 });
  ui.rays.style.transform += ` rotate(${(t * 6).toFixed(2)}deg)`;
  show(ui.word, env(t, 9.4, null, 1.3), { y: 0, blur: 40, scale: 0.12 });
  ui.word.style.letterSpacing = `${lerp(0.14, -0.04, E.out5(seg(t, 9.4, 12))).toFixed(4)}em`;
  letters(ui.tagL, t, 10.1, { stagger: .022, dur: .8, y: 24, blur: 12 });
  show(ui.now, env(t, 10.7, null, .7), { y: 10, blur: 8 });
  return { scene, camera: cam, bloom: [rays > 0 ? 0.6 : 0.32, 0.55, 0.85], exposure: 1.0, grain: 0.11 };
};
export default S;
