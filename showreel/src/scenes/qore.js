// 03 Technology — QORE N1 on-device AI processor
import * as THREE from 'three';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { el, split, letters, show, env, seg, E, lerp, mix, setText, rnd } from '../lib.js';
import { backdrop, studioEnv, canvasTex, roundRect, roundedSlab, glowSprite, lookCam } from '../gl.js';
import { hud } from '../ui.js';

const ACC = '#39e6ff';
const S = { name: 'qore', dur: 12, accent: ACC };
let scene, cam, ihs, die, dieM, pulses = [], bd, H, ui = {}, glow;
const B = 7; // board half-size

function traces() {
  const out = [];
  const sides = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  for (const [sx, sz] of sides) {
    const n = 11;
    for (let i = 0; i < n; i++) {
      const o = lerp(-0.82, 0.82, i / (n - 1));
      const a = 1.08, b = 1.45 + rnd(i * 7 + sx * 3 + sz) * 0.25, spread = 1.9 + rnd(i + 40) * 0.4;
      const p = [[a, o], [b, o], [b + Math.abs(o * spread) * 0.8, o * (1 + spread)], [B + 0.5, o * (1 + spread)]];
      // map local (along, across) into the side's frame
      out.push(p.map(([u, v]) => sx ? [u * sx, v] : [v, u * sz]));
    }
  }
  return out;
}

S.init = (ctx) => {
  scene = new THREE.Scene();
  scene.fog = new THREE.Fog('#03060b', 5, 13);
  scene.environment = studioEnv(ctx.renderer, [
    { pos: [-3.2, 8, 0], size: [1.6, 9], intensity: 1.3 },
    { pos: [3.5, 8, 2], size: [0.8, 9], color: ACC, intensity: 1.6 },
    { pos: [-6, 2, 2], size: [1.2, 8], color: ACC, intensity: 5 },
    { pos: [6, 2, -2], size: [1.2, 8], color: '#8a5cff', intensity: 2 },
    { pos: [0, 2, 7], size: [9, 1], intensity: 3 },
    { pos: [0, 1, -7], size: [9, 1], color: '#3fb6ff', intensity: 1.5 },
  ]);
  cam = new THREE.PerspectiveCamera(32, 16 / 9, 0.05, 100);
  bd = backdrop({ c0: '#03060b', c1: '#06223a', g1: [0.5, 0.75, 0.6, 1], c2: '#140b2c', g2: [0.9, 0.9, 0.5, 1] });
  scene.add(bd);

  const T = traces();
  // PCB texture
  const px = v => (v + B) / (2 * B) * 4096;
  const board = canvasTex(4096, 4096, (g, w, h) => {
    g.fillStyle = '#070b10'; g.fillRect(0, 0, w, h);
    // faint fill pattern
    g.strokeStyle = 'rgba(70,110,140,.06)'; g.lineWidth = 2;
    for (let i = 0; i < 4096; i += 24) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, h); g.stroke(); }
    g.lineCap = 'round'; g.lineJoin = 'round';
    for (const tr of T) {
      g.strokeStyle = '#21404f'; g.lineWidth = 10; g.beginPath();
      tr.forEach(([x, z], i) => i ? g.lineTo(px(x), px(z)) : g.moveTo(px(x), px(z))); g.stroke();
      const [x0, z0] = tr[1]; g.fillStyle = '#2b4655'; g.beginPath(); g.arc(px(x0), px(z0), 9, 0, 7); g.fill();
    }
    // vias and stray traces
    for (let i = 0; i < 900; i++) {
      const x = rnd(i) * w, y = rnd(i + 1) * h; if (Math.abs(x - w / 2) < 700 && Math.abs(y - h / 2) < 700) continue;
      g.fillStyle = 'rgba(60,90,110,.5)'; g.beginPath(); g.arc(x, y, 4 + rnd(i + 2) * 5, 0, 7); g.fill();
    }
    g.fillStyle = 'rgba(200,220,235,.35)'; g.font = '500 34px "JetBrains Mono"'; g.letterSpacing = '8px';
    g.fillText('QORE N1 · REV 2.0 · 2026', px(-2.6), px(2.45)); g.fillText('U1', px(1.1), px(-1.15));
  });
  const boardM = new THREE.MeshPhysicalMaterial({ map: board, roughness: 0.6, metalness: 0.15, clearcoat: 0.35, clearcoatRoughness: 0.35 });
  const boardMesh = new THREE.Mesh(new THREE.PlaneGeometry(2 * B, 2 * B), boardM);
  boardMesh.rotation.x = -Math.PI / 2; scene.add(boardMesh);

  // light pulses travelling along the traces toward the chip
  for (const [k, tr] of T.entries()) {
    const pts = []; [...tr].reverse().forEach(([x, z]) => pts.push(x, 0.004, z));
    const g = new LineGeometry(); g.setPositions(pts);
    const m = new LineMaterial({ color: new THREE.Color(k % 5 === 0 ? '#9d7bff' : ACC).multiplyScalar(4), linewidth: 2.2, dashed: true, dashSize: 0.22 + rnd(k + 21) * 0.3, gapSize: 3.6 + rnd(k + 13) * 2, transparent: true, toneMapped: false });
    m.resolution.set(1920, 1080);
    const l = new Line2(g, m); l.computeLineDistances(); l.phase = rnd(k + 3) * 4.55; l.speed = 1.6 + rnd(k + 8) * 1.2;
    scene.add(l); pulses.push(l);
  }

  // package substrate
  const sub = new THREE.Mesh(roundedSlab(2.1, 2.1, 0.07, 0.05, 0.01, 3), new THREE.MeshPhysicalMaterial({ color: '#0d1a14', roughness: 0.55, clearcoat: .5 }));
  sub.rotation.x = -Math.PI / 2; sub.position.y = 0.035; scene.add(sub);
  // SMD caps around the package
  const capG = new THREE.BoxGeometry(0.09, 0.045, 0.045), capM = new THREE.MeshPhysicalMaterial({ color: '#7a6a52', roughness: .45 });
  const endM = new THREE.MeshPhysicalMaterial({ color: '#d9dde3', metalness: 1, roughness: .25 });
  for (let i = 0; i < 28; i++) {
    const s = i % 4, k = Math.floor(i / 4), o = -0.75 + k * 0.25;
    const c = new THREE.Mesh(capG, i % 3 ? capM : endM);
    c.position.set(s === 0 ? 0.92 : s === 1 ? -0.92 : o, 0.093, s === 2 ? 0.92 : s === 3 ? -0.92 : o);
    if (s > 1) c.rotation.y = Math.PI / 2; scene.add(c);
  }
  // silicon die: iridescent glass with glowing cores
  const coreTex = canvasTex(1024, 1024, (g, w, h) => {
    g.fillStyle = '#000'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) {
      const x = 60 + i * 113, y = 60 + j * 113, big = (i > 1 && i < 6 && j > 1 && j < 6);
      g.fillStyle = big ? '#39e6ff' : 'rgba(120,90,255,.9)'; g.globalAlpha = big ? 0.95 : 0.55;
      roundRect(g, x, y, 92, 92, 10); g.fill();
      g.globalAlpha = 1; g.fillStyle = '#000'; roundRect(g, x + 14, y + 14, 64, 64, 6); g.fill();
    }
  });
  dieM = new THREE.MeshPhysicalMaterial({ color: '#141a24', metalness: 0.6, roughness: 0.12, iridescence: 1, iridescenceIOR: 1.8, iridescenceThicknessRange: [200, 800], emissive: '#ffffff', emissiveMap: coreTex, emissiveIntensity: 0 });
  die = new THREE.Mesh(roundedSlab(1.0, 1.0, 0.05, 0.03, 0.006, 2), dieM);
  die.rotation.x = -Math.PI / 2; die.position.y = 0.095; scene.add(die);
  glow = glowSprite(ACC, 2.4, { intensity: 0.5 }); glow.position.set(0, 0.12, 0); scene.add(glow);
  // heat spreader with engraving
  const lap = canvasTex(1024, 1024, (g, w, h) => {
    g.fillStyle = '#808080'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 700; i++) { const r = rnd(i) * 720; g.strokeStyle = `rgba(${rnd(i + 1) > .5 ? 255 : 0},${rnd(i + 1) > .5 ? 255 : 0},${rnd(i + 1) > .5 ? 255 : 0},.12)`; g.lineWidth = 1 + rnd(i + 2) * 2; g.beginPath(); g.arc(w / 2, h / 2, r, 0, 7); g.stroke(); }
  }, { linear: true });
  const engr = canvasTex(1024, 1024, (g, w, h) => {
    g.fillStyle = '#c9ccd2'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#5d636c'; g.font = '700 190px "Space Grotesk"'; g.letterSpacing = '6px'; g.fillText('QORE', 150, 470);
    g.font = '400 120px "Space Grotesk"'; g.fillText('N1', 160, 620);
    g.font = '500 34px "JetBrains Mono"'; g.letterSpacing = '6px'; g.fillText('3NM · NPU-32 · 2026', 160, 760); g.fillText('QX-4821-A', 160, 812);
    g.beginPath(); g.arc(130, 130, 22, 0, 7); g.fill();
  });
  ihs = new THREE.Group();
  const ihsM = new THREE.MeshPhysicalMaterial({ map: engr, metalness: 1, roughness: 0.3, roughnessMap: lap, clearcoat: .3 });
  const ihsMesh = new THREE.Mesh(roundedSlab(1.66, 1.66, 0.11, 0.12, 0.025, 6), [ihsM, new THREE.MeshPhysicalMaterial({ color: '#b8bcc4', metalness: 1, roughness: 0.22 })]);
  ihsMesh.rotation.x = -Math.PI / 2; ihsMesh.rotation.z = 0; ihs.add(ihsMesh); scene.add(ihs);

  // ---- overlay
  const r = ctx.root;
  H = hud(r, { num: '03', cat: 'Technology', product: 'QORE · N1 Neural Processor', accent: ACC });
  ui.h1 = el(r, 'Built for', { left: '96px', top: '700px', font: '500 116px/1 "Space Grotesk"', letterSpacing: '-.035em' });
  ui.h2 = el(r, 'what’s next.', { left: '96px', top: '822px', font: '300 116px/1 "Space Grotesk"', letterSpacing: '-.035em', color: ACC });
  ui.h1L = split(ui.h1); ui.h2L = split(ui.h2);
  ui.specs = [['3', 'nm', 'PROCESS NODE'], ['48', 'TOPS', 'NEURAL ENGINE'], ['32', 'cores', 'NPU CLUSTER'], ['0', 'ms', 'CLOUD ROUND-TRIP']].map(([v, u, l], i) => {
    const b = el(r, `<div style="font:500 13px 'JetBrains Mono';letter-spacing:.24em;color:rgba(255,255,255,.55)">${l}</div><div style="font:500 66px/1.1 'Space Grotesk';letter-spacing:-.03em"><span class="v">${v}</span><span style="font-weight:300;font-size:30px;margin-left:10px;color:${ACC}">${u}</span></div>`,
      { left: '1480px', top: `${250 + i * 150}px`, paddingLeft: '26px', borderLeft: `1px solid rgba(57,230,255,.35)` });
    b.v = b.querySelector('.v'); b.val = +v; return b;
  });
  ui.word = el(r, 'QORE<span style="font-weight:300;color:' + ACC + ';margin-left:.18em">N1</span>', { left: 0, width: '1920px', textAlign: 'center', top: '770px', font: '700 150px/1 "Space Grotesk"', letterSpacing: '-.02em' });
  ui.tag = el(r, 'Intelligence, on device.', { left: 0, width: '1920px', textAlign: 'center', top: '940px', font: '400 34px "Space Grotesk"', color: 'rgba(255,255,255,.8)', letterSpacing: '.01em' });
  ui.tagL = split(ui.tag);
};

S.update = (t) => {
  const d = S.dur;
  scene.environmentRotation.set(0, t * 0.2, 0);
  let lift = 0, burst = 0;
  if (t < 4) {
    const u = E.ioSine(seg(t, 0, 4));
    lookCam(cam, mix([-4.2, 0.42, 4.6], [-1.9, 0.75, 2.7], u), mix([0.6, 0.0, -0.4], [0.1, 0.1, 0], u), -0.04);
    cam.fov = 30;
  } else if (t < 8) {
    const u = E.ioSine(seg(t, 4, 8));
    lift = E.io5(seg(t, 4.25, 5.5));
    lookCam(cam, mix([3.0, 2.4, 3.2], [1.6, 2.9, 3.7], u), [0, 0.45, 0]);
    cam.fov = 34;
  } else {
    const u = E.io3(seg(t, 8, 10.5));
    lift = 1 - E.io5(seg(t, 8.0, 8.85));
    burst = Math.exp(-(((t - 8.9) / 0.45) ** 2));
    const v = E.io3(seg(t, 8, 11.2));
    cam.position.set(Math.sin(v * 0.8) * 0.2, lerp(3.4, 6.6, v), lerp(3.6, 1.35, v));
    cam.up.set(0, 1 - v, -v * 1.2 - 0.0001).normalize();
    cam.lookAt(0, 0, lerp(0.3, 1.05, v));
    cam.rotateZ(lerp(0, 0.12, seg(t, 8, 12)));
    cam.fov = 30;
  }
  cam.updateProjectionMatrix();
  ihs.position.y = 0.125 + lift * 1.05;
  ihs.rotation.set(lift * 0.22, lift * 0.35, -lift * 0.12);
  dieM.emissiveIntensity = 2.4 * lift;
  glow.material.opacity = 0.8 * lift; glow.visible = lift > 0.01;
  pulses.forEach((l, i) => {
    l.material.dashOffset = -(l.phase + t * l.speed);
    l.material.opacity = 0.9;
    l.material.linewidth = 2.2 + burst * 1.6;
  });
  bd.u.g1.value.w = 0.8 + burst * 0.4;

  // ---- overlay
  H(t, d);
  letters(ui.h1L, t, 0.6, { stagger: .035, dur: .8, y: 70, blur: 18, out: 3.4, outDur: .3, outStagger: .01 });
  letters(ui.h2L, t, 0.95, { stagger: .035, dur: .8, y: 70, blur: 18, out: 3.45, outDur: .3, outStagger: .01 });
  ui.specs.forEach((b, i) => {
    const a = 5.0 + i * 0.32;
    show(b, env(t, a, 7.6 + i * 0.04, .7, .3), { x: 40, y: 0, blur: 12 });
    setText(b.v, String(Math.round(b.val * E.out4(seg(t, a, a + 1.0)))));
  });
  show(ui.word, env(t, 9.3, null, 1.1), { y: 0, blur: 30, scale: 0.08 });
  ui.word.style.letterSpacing = `${lerp(0.12, -0.02, E.out5(seg(t, 9.3, 11.8))).toFixed(4)}em`;
  letters(ui.tagL, t, 9.9, { stagger: .018, dur: .7, y: 20, blur: 10 });
  return { scene, camera: cam, bloom: [0.85, 0.55, 0.75], exposure: 1.0, grain: 0.1 };
};
export default S;
