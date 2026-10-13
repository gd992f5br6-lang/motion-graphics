// 02 Finance & Commerce — VELORA Metal Card
import * as THREE from 'three';
import { el, split, letters, show, env, seg, E, lerp, mix, setText, fmtNum, rnd } from '../lib.js';
import { backdrop, studioEnv, canvasTex, roundRect, roundedSlab, glowSprite, lookCam, project } from '../gl.js';
import { hud } from '../ui.js';

const ACC = '#e6c27a';
const S = { name: 'velora', dur: 12, accent: ACC };
let scene, cam, card, cardG, bars = [], rings = [], grid, bd, H, ui = {};
const CW = 3.2, CH = 2.02, CD = 0.036;

S.init = (ctx) => {
  scene = new THREE.Scene();
  scene.environment = studioEnv(ctx.renderer, [
    { pos: [0, 7, 1], size: [9, 3], color: '#fff1dc', intensity: 3.2 },
    { pos: [-6, 1, 3], size: [1.4, 10], intensity: 8 },
    { pos: [6, 0, 2], size: [1.2, 10], color: '#ffd9a0', intensity: 7 },
    { pos: [0, -5, 5], size: [10, 1], color: '#ffe2b0', intensity: 3 },
    { pos: [0, 1, -7], size: [12, 1.5], color: ACC, intensity: 4 },
    { pos: [3, 3, 6], size: [2, 2], intensity: 2 },
  ]);
  cam = new THREE.PerspectiveCamera(30, 16 / 9, 0.05, 100);
  bd = backdrop({ c0: '#050507', c1: '#2b2010', g1: [0.5, 0.5, 0.5, 1], c2: '#0a0f1c', g2: [0.85, 0.15, 0.5, 1] });
  scene.add(bd);

  cardG = new THREE.Group(); scene.add(cardG);
  card = new THREE.Group(); cardG.add(card);
  // brushed steel face via a streaked roughness map
  const brushed = canvasTex(1024, 1024, (g, w, h) => {
    g.fillStyle = '#7a7a7a'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 2600; i++) { const y = rnd(i) * h, v = 90 + rnd(i + 5) * 90; g.fillStyle = `rgb(${v},${v},${v})`; g.globalAlpha = 0.35; g.fillRect(0, y, w, 0.6 + rnd(i + 9) * 1.4); }
  }, { linear: true });
  const face = new THREE.MeshPhysicalMaterial({ color: '#202024', metalness: 1, roughness: 0.42, roughnessMap: brushed, anisotropy: 0.9, clearcoat: 0.25, clearcoatRoughness: 0.2 });
  const edge = new THREE.MeshPhysicalMaterial({ color: '#e2b864', metalness: 1, roughness: 0.14 });
  const slab = new THREE.Mesh(roundedSlab(CW, CH, CD, 0.13, 0.008, 6), [face, edge]);
  card.add(slab);
  // gold foil artwork on the face
  const foil = canvasTex(2048, 1293, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    const gold = g.createLinearGradient(0, 0, w, h); gold.addColorStop(0, '#f6e2ae'); gold.addColorStop(.5, '#d3a75a'); gold.addColorStop(1, '#f1d595');
    g.fillStyle = gold; g.strokeStyle = gold;
    g.font = '400 150px "Instrument Serif"'; g.textBaseline = 'alphabetic';
    g.letterSpacing = '30px'; g.fillText('VELORA', 140, 260);
    g.font = '500 44px "JetBrains Mono"'; g.letterSpacing = '14px';
    g.fillText('4821  0947  3310  2026', 140, 1010);
    g.font = '500 34px "JetBrains Mono"'; g.letterSpacing = '8px';
    g.fillText('ALEX  MORGAN', 140, 1150); g.fillText('09/31', 1620, 1150);
    // contactless glyph
    g.lineWidth = 12; g.lineCap = 'round';
    for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(1700, 600, 40 + i * 34, -0.75, 0.75); g.stroke(); }
    // fine guilloche lines
    g.globalAlpha = 0.18; g.lineWidth = 2;
    for (let i = 0; i < 46; i++) { g.beginPath(); for (let x = 1100; x <= w; x += 8) { const y = 300 + i * 9 + Math.sin(x * 0.006 + i * 0.25) * 60; x === 1100 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke(); }
  });
  const foilM = new THREE.MeshPhysicalMaterial({ map: foil, metalness: 1, roughness: 0.22, transparent: true, alphaTest: 0.02 });
  const foilP = new THREE.Mesh(new THREE.PlaneGeometry(CW, CH), foilM); foilP.position.z = CD / 2 + 0.0015; card.add(foilP);
  // EMV chip
  const chipTex = canvasTex(512, 400, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#f5dc9c'); gr.addColorStop(1, '#b8893f');
    g.fillStyle = gr; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(80,50,10,.6)'; g.lineWidth = 6;
    g.beginPath(); g.moveTo(0, h / 3); g.lineTo(w * .35, h / 3); g.moveTo(0, 2 * h / 3); g.lineTo(w * .35, 2 * h / 3);
    g.moveTo(w, h / 3); g.lineTo(w * .65, h / 3); g.moveTo(w, 2 * h / 3); g.lineTo(w * .65, 2 * h / 3);
    g.moveTo(w * .35, 0); g.lineTo(w * .35, h); g.moveTo(w * .65, 0); g.lineTo(w * .65, h); g.stroke();
    roundRect(g, w * .35, h * .22, w * .3, h * .56, 30); g.stroke();
  });
  const chip = new THREE.Mesh(roundedSlab(0.42, 0.33, 0.012, 0.06, 0.003, 3), new THREE.MeshPhysicalMaterial({ map: chipTex, metalness: 1, roughness: 0.25 }));
  chip.position.set(-CW / 2 + 0.52, 0.12, CD / 2); card.add(chip);
  // back: plain engraved text
  const back = canvasTex(2048, 1293, (g, w, h) => {
    g.fillStyle = 'rgba(230,194,122,.9)'; g.font = '500 30px "JetBrains Mono"'; g.letterSpacing = '10px';
    g.fillText('VELORA · PRIVATE · STAINLESS STEEL 18 G', 140, 1150);
    g.font = 'italic 400 90px "Instrument Serif"'; g.letterSpacing = '0px'; g.fillText('Banking, refined.', 140, 220);
  });
  const backP = new THREE.Mesh(new THREE.PlaneGeometry(CW, CH), new THREE.MeshPhysicalMaterial({ map: back, metalness: 1, roughness: .3, transparent: true, alphaTest: .02 }));
  backP.position.z = -CD / 2 - 0.0015; backP.rotation.y = Math.PI; card.add(backP);

  // growth bars behind the card
  const barM = new THREE.MeshPhysicalMaterial({ color: '#e7c584', metalness: 1, roughness: 0.18 });
  const barG = roundedSlab(0.34, 1, 0.34, 0.05, 0.02, 3); barG.translate(0, 0.5, 0);
  for (let i = 0; i < 9; i++) {
    const b = new THREE.Mesh(barG, barM);
    b.position.set(-3.2 + i * 0.8, -1.7, -2.2 - Math.sin(i / 8 * Math.PI) * 0.6);
    b.h = 0.5 + i * 0.36 + (i % 3 === 1 ? -0.25 : 0) + (i === 8 ? 0.5 : 0);
    scene.add(b); bars.push(b);
  }
  // fine floor grid
  const gp = [];
  for (let i = -12; i <= 12; i++) { gp.push(i * 0.6, -1.7, -8, i * 0.6, -1.7, 3); gp.push(-7.2, -1.7, -8 + (i + 12) * 0.46, 7.2, -1.7, -8 + (i + 12) * 0.46); }
  const gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.Float32BufferAttribute(gp, 3));
  grid = new THREE.LineSegments(gg, new THREE.LineBasicMaterial({ color: '#e6c27a', transparent: true, opacity: 0.0 }));
  scene.add(grid);
  // contactless ripples
  for (let i = 0; i < 4; i++) {
    const m = new THREE.Mesh(new THREE.TorusGeometry(1, 0.006, 8, 160), new THREE.MeshBasicMaterial({ color: new THREE.Color(ACC).multiplyScalar(2.5), transparent: true, toneMapped: false }));
    scene.add(m); rings.push(m);
  }

  // ---- overlay
  const r = ctx.root;
  H = hud(r, { num: '02', cat: 'Finance & Commerce', product: 'VELORA · Private Metal Card', accent: ACC });
  ui.h1 = el(r, 'Forged in steel.', { left: '96px', top: '760px', font: '400 120px/1 "Instrument Serif"', letterSpacing: '-.01em' });
  ui.h1L = split(ui.h1);
  ui.h1s = el(r, '18 G STAINLESS&nbsp;&nbsp;·&nbsp;&nbsp;24K GOLD EDGE&nbsp;&nbsp;·&nbsp;&nbsp;LASER-ETCHED', { left: '100px', top: '900px', font: '500 15px "JetBrains Mono"', letterSpacing: '.24em', color: 'rgba(255,255,255,.62)' });
  // balance block
  ui.bal = el(r, '', { left: '96px', top: '210px' });
  el(ui.bal, 'TOTAL BALANCE', { left: 0, top: 0, font: '500 14px "JetBrains Mono"', letterSpacing: '.24em', color: 'rgba(255,255,255,.6)' });
  ui.balV = el(ui.bal, '€0.00', { left: 0, top: '30px', font: '400 112px/1 "Instrument Serif"', letterSpacing: '-.01em' });
  ui.pill = el(ui.bal, '▲ 12.4% this month', { left: '4px', top: '160px', font: '500 17px "Inter Tight"', color: '#9cf0b6', padding: '9px 16px', borderRadius: '40px', background: 'rgba(80,220,140,.12)', border: '1px solid rgba(120,240,170,.25)' });
  // transaction feed (frosted panel)
  ui.feed = el(r, '', { left: '1356px', top: '250px', width: '468px', height: '420px', borderRadius: '28px', background: 'rgba(255,255,255,.055)', border: '1px solid rgba(255,255,255,.12)', backdropFilter: 'blur(26px) saturate(140%)' });
  el(ui.feed, 'RECENT ACTIVITY', { left: '30px', top: '28px', font: '500 13px "JetBrains Mono"', letterSpacing: '.24em', color: 'rgba(255,255,255,.55)' });
  const TX = [['S', 'Studio North', 'Salary', '+€4,250.00', '#9cf0b6'], ['A', 'Atelier Café', 'Food & drink', '−€4.80', '#fff'], ['R', 'Rail Pass', 'Travel', '−€89.00', '#fff'], ['V', 'Gold Vault', 'Savings · auto', '+€500.00', ACC]];
  ui.rows = TX.map(([ic, n, c, a, col], i) => {
    const row = el(ui.feed, `<div style="position:absolute;left:0;top:0;width:52px;height:52px;border-radius:50%;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);display:flex;align-items:center;justify-content:center;font:500 20px 'Inter Tight';color:${i === 3 ? ACC : '#fff'}">${ic}</div>
      <div style="position:absolute;left:72px;top:4px;font:500 21px 'Inter Tight'">${n}</div><div style="position:absolute;left:72px;top:31px;font:400 16px 'Inter Tight';color:rgba(255,255,255,.5)">${c}</div>
      <div style="position:absolute;right:0;top:12px;font:500 21px 'Inter Tight';color:${col}">${a}</div>`, { left: '30px', top: `${82 + i * 82}px`, width: '408px', height: '56px' });
    return row;
  });
  // payment confirmation
  ui.paid = el(r, `<div style="display:flex;align-items:center;gap:16px"><div style="width:46px;height:46px;border-radius:50%;background:${ACC};display:flex;align-items:center;justify-content:center"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a1408" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></div><div><div style="font:500 24px 'Inter Tight'">Paid · €4.80</div><div style="font:400 16px 'Inter Tight';color:rgba(255,255,255,.55)">Atelier Café · just now</div></div></div>`,
    { left: '760px', top: '120px', width: '400px', padding: '18px 26px', borderRadius: '60px', background: 'rgba(20,18,14,.55)', border: '1px solid rgba(230,194,122,.35)', backdropFilter: 'blur(20px)' });
  ui.word = el(r, 'VELORA', { left: 0, width: '1920px', textAlign: 'center', top: '742px', font: '400 168px/1 "Instrument Serif"', letterSpacing: '.3em', textIndent: '.3em', color: '#f3dfb0' });
  ui.wordL = split(ui.word);
  ui.tag = el(r, 'BANKING,&nbsp;&nbsp;REFINED.', { left: 0, width: '1920px', textAlign: 'center', top: '930px', font: '500 17px "JetBrains Mono"', letterSpacing: '.5em', textIndent: '.5em', color: 'rgba(255,255,255,.75)' });
  ui.tagL = split(ui.tag);
};

S.update = (t) => {
  const d = S.dur;
  scene.environmentRotation.set(0, 0.4 - t * 0.16, 0);
  let barsOn = 0, gridOp = 0;
  if (t < 4) {
    // Shot A: card turns from edge-on to face, light sweeping
    const u = E.out3(seg(t, 0, 4));
    cardG.position.set(0.45, 0.25, 0);
    cardG.rotation.set(-0.22, lerp(-1.45, -0.32, E.out4(seg(t, 0, 3.6))), lerp(0.25, 0.08, u));
    card.rotation.set(0, 0, 0);
    lookCam(cam, [lerp(1.2, 0.6, u), lerp(-0.2, 0.15, u), lerp(5.2, 4.6, u)], [0.45, 0.2, 0], 0.02);
    cam.fov = 32;
  } else if (t < 8) {
    // Shot B: tilted card floats over a growth chart
    const u = E.ioSine(seg(t, 4, 8));
    cardG.position.set(0, -0.15 + Math.sin(t * 1.3) * 0.04, 0.6);
    cardG.rotation.set(-1.05 + 0.08 * Math.sin(t * .9), 0, lerp(0.5, 0.28, u));
    lookCam(cam, [lerp(-1.6, 1.4, u), lerp(2.6, 2.2, u), lerp(6.6, 6.3, u)], [0, -0.4, -0.6]);
    cam.fov = 34; barsOn = 1; gridOp = 1;
  } else {
    // Shot C: card faces camera, taps (contactless), then rises for the end card
    const u = seg(t, 8, 12);
    const tap = E.io3(seg(t, 8, 8.9)) - E.io3(seg(t, 9.2, 10.2));
    const rise = E.io5(seg(t, 9.6, 11.0));
    cardG.position.set(0, lerp(0, 0.75, rise), lerp(0, 1.1, tap) - rise * 0.6);
    cardG.rotation.set(lerp(0.12, -0.05, u) - rise * 0.15, lerp(-0.35, 0.3, E.ioSine(u)), lerp(-0.05, 0, u));
    lookCam(cam, [0, 0.1 + rise * 0.3, 6.4 + rise * 1.2], [0, rise * 0.35, 0]);
    cam.fov = 30;
  }
  cam.updateProjectionMatrix();
  bars.forEach((b, i) => {
    const p = barsOn * E.outBack(seg(t, 4.3 + i * 0.12, 5.3 + i * 0.12), 1.1);
    b.visible = p > 0.001; b.scale.set(1, Math.max(0.001, b.h * p), 1);
  });
  grid.material.opacity = gridOp * 0.14 * E.out3(seg(t, 4, 4.8));
  grid.visible = gridOp > 0;
  rings.forEach((m, i) => {
    const a = 8.75 + i * 0.16, p = seg(t, a, a + 1.1);
    m.visible = p > 0 && p < 1;
    m.position.set(cardG.position.x, cardG.position.y, cardG.position.z + 0.05);
    m.rotation.copy(cardG.rotation);
    m.scale.setScalar(lerp(0.4, 3.2, E.out3(p)));
    m.material.opacity = (1 - p) ** 1.5;
  });
  bd.u.g1.value.y = t < 8 ? 0.55 : lerp(0.5, 0.62, E.io5(seg(t, 9.6, 11)));

  // ---- overlay
  H(t, d);
  letters(ui.h1L, t, 0.7, { stagger: .03, dur: .9, y: 60, blur: 20, out: 3.4, outDur: .3, outStagger: .008 });
  show(ui.h1s, env(t, 1.5, 3.4, .7, .3), { y: 14, blur: 8 });
  show(ui.bal, env(t, 4.35, 7.65, .8, .35), { y: 30, blur: 16 });
  setText(ui.balV, '€' + fmtNum(48260.4 * E.out5(seg(t, 4.35, 6.4)), 2));
  show(ui.pill, env(t, 5.6, null, .6), { y: 10, blur: 6, scale: .1 });
  show(ui.feed, env(t, 4.8, 7.7, .8, .35), { x: 60, y: 0, blur: 16 });
  ui.rows.forEach((row, i) => show(row, env(t, 5.2 + i * 0.28, null, .7), { x: 30, y: 0, blur: 10 }));
  show(ui.paid, env(t, 8.85, 9.9, .6, .35), { y: -20, blur: 10, scale: .15 });
  ui.word.style.letterSpacing = `${lerp(0.5, 0.3, E.out5(seg(t, 9.7, 12))).toFixed(4)}em`;
  letters(ui.wordL, t, 9.8, { stagger: .06, dur: 1.1, y: 0, blur: 28 });
  letters(ui.tagL, t, 10.4, { stagger: .018, dur: .6, y: 0, blur: 10 });
  return { scene, camera: cam, bloom: [0.45, 0.5, 0.85], exposure: 1.0, grain: 0.1 };
};
export default S;
