// 01 Fitness & Health — VYTA Smart Ring
import * as THREE from 'three';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { el, split, letters, show, env, seg, E, lerp, mix, kf, setText, clamp } from '../lib.js';
import { backdrop, studioEnv, project, glowSprite, lookCam } from '../gl.js';
import { hud } from '../ui.js';

const ACC = '#ff4b36';
const S = { name: 'vyta', dur: 12, accent: ACC };
let scene, cam, ring, ringG, ecg, ecgN, head, bd, H, ui = {}, leds = [];

function profile(rc, a, b, cr, n = 14) {
  const pts = [];
  const C = [[rc + a - cr, -b + cr, -Math.PI / 2], [rc + a - cr, b - cr, 0], [rc - a + cr, b - cr, Math.PI / 2], [rc - a + cr, -b + cr, Math.PI]];
  for (const [cx, cy, a0] of C) for (let i = 0; i <= n; i++) { const an = a0 + i / n * Math.PI / 2; pts.push(new THREE.Vector2(cx + cr * Math.cos(an), cy + cr * Math.sin(an))); }
  pts.push(pts[0].clone());
  return pts;
}
// ECG waveform, phase 0..1
const ecgY = (ph) => {
  const g = (c, w, h) => h * Math.exp(-(((ph - c) / w) ** 2));
  return g(.12, .035, .1) + g(.27, .012, -.12) + g(.3, .012, 1) + g(.33, .014, -.32) + g(.56, .055, .22);
};

S.init = (ctx) => {
  scene = new THREE.Scene();
  scene.environment = studioEnv(ctx.renderer, [
    { pos: [0, 7, 2], size: [12, 3], intensity: 3 },
    { pos: [-6, 0, 4], size: [1.4, 11], intensity: 10 },
    { pos: [6, 0, 1], size: [1.6, 11], color: ACC, intensity: 9 },
    { pos: [0, -4.5, 6], size: [11, 0.9], intensity: 4 },
    { pos: [0, 0, -7], size: [14, 2], color: '#ff8a6a', intensity: 4 },
    { pos: [3, 3, 6], size: [2.5, 2.5], intensity: 2.5 },
  ]);
  cam = new THREE.PerspectiveCamera(30, 16 / 9, 0.05, 100);
  bd = backdrop({ c0: '#050506', c1: '#3b0c07', g1: [0.5, 0.5, 0.42, 1], c2: '#0b1222', g2: [0.12, 0.9, 0.5, 1] });
  scene.add(bd);

  ringG = new THREE.Group(); scene.add(ringG);
  ring = new THREE.Group(); ringG.add(ring);
  const ti = new THREE.MeshPhysicalMaterial({ color: '#6a6a72', metalness: 1, roughness: 0.16, clearcoat: 0.5, clearcoatRoughness: 0.06, anisotropy: 0.5, side: THREE.DoubleSide });
  const shell = new THREE.Mesh(new THREE.LatheGeometry(profile(1.0, 0.085, 0.2, 0.06), 256), ti);
  ring.add(shell);
  // inner resin band + sensors
  const resin = new THREE.MeshPhysicalMaterial({ color: '#050505', metalness: 0, roughness: 0.12, clearcoat: 1, side: THREE.DoubleSide });
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.912, 0.912, 0.27, 256, 1, true), resin);
  ring.add(band);
  const domeG = new THREE.SphereGeometry(0.05, 32, 16);
  for (const [ang, col] of [[-0.22, '#28ff8c'], [0, '#ff3b2f'], [0.22, '#28ff8c']]) {
    const a = -Math.PI / 2 + ang;
    const dome = new THREE.Mesh(domeG, resin); dome.scale.set(1, 0.6, 0.35);
    dome.position.set(Math.cos(a) * 0.905, 0, Math.sin(a) * 0.905); dome.lookAt(0, 0, 0); ring.add(dome);
    const led = new THREE.Mesh(new THREE.SphereGeometry(0.014, 16, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(col).multiplyScalar(6), toneMapped: false }));
    led.position.set(Math.cos(a) * 0.885, 0, Math.sin(a) * 0.885); ring.add(led); leds.push(led);
    const gl = glowSprite(col, 0.22, { intensity: 1.2 }); gl.position.copy(led.position); ring.add(gl); leds.push(gl);
  }

  // ECG trace behind the ring
  const pts = []; ecgN = 1200;
  for (let i = 0; i <= ecgN; i++) { const x = lerp(-5.2, 5.2, i / ecgN); const ph = ((x + 5.2) / 2.35) % 1; pts.push(x, ecgY(ph) * 0.9 - 0.05, -0.7); }
  const lg = new LineGeometry(); lg.setPositions(pts);
  const lm = new LineMaterial({ color: new THREE.Color(ACC).multiplyScalar(3.2), linewidth: 3.2, worldUnits: false, transparent: true, toneMapped: false });
  lm.resolution.set(1920, 1080);
  ecg = new Line2(lg, lm); ecg.computeLineDistances(); scene.add(ecg);
  ecg.pts = pts;
  head = glowSprite('#ffd2c6', 0.32, { intensity: 2.2, core: .05 }); scene.add(head);

  // ---- overlay
  const r = ctx.root;
  H = hud(r, { num: '01', cat: 'Fitness & Health', product: 'VYTA · Smart Ring Series 2', accent: ACC });
  ui.facts = ['Titanium.', '4 grams.', '7-day battery.'].map((s, i) => {
    const n = el(r, s, { left: '96px', top: `${640 + i * 92}px`, font: `${i === 0 ? 500 : 300} 84px/1 "Unbounded"`, letterSpacing: '-.02em', color: i === 0 ? '#fff' : 'rgba(255,255,255,.78)' });
    return split(n);
  });
  // metric callouts
  const callout = (val, unit, label, x, y, align) => {
    const box = el(r, '', { left: `${x}px`, top: `${y}px`, width: '360px', textAlign: align });
    const lab = el(box, label, { [align]: 0, top: 0, font: '500 14px "JetBrains Mono"', letterSpacing: '.24em', color: 'rgba(255,255,255,.6)' });
    const v = el(box, `<span class="v">${val}</span><span style="font:300 30px Unbounded;margin-left:10px;color:rgba(255,255,255,.65)">${unit}</span>`, { [align]: 0, top: '26px', font: '500 76px/1 "Unbounded"', letterSpacing: '-.03em' });
    const ln = el(box, '', { [align]: 0, top: '-18px', height: '2px', width: '48px', background: ACC, transformOrigin: align === 'left' ? '0 50%' : '100% 50%' });
    return { box, lab, v, ln, vs: v.querySelector('.v') };
  };
  ui.c1 = callout('62', 'bpm', 'HEART RATE', 150, 300, 'left');
  ui.c2 = callout('94', '%', 'RECOVERY', 1410, 300, 'right');
  ui.c3 = callout('7:42', 'h', 'DEEP + REM SLEEP', 1410, 690, 'right');
  ui.c4 = callout('41.2', 'ms', 'HRV · RMSSD', 150, 690, 'left');
  // recovery arc
  ui.arc = el(r, `<svg width="120" height="120" viewBox="0 0 120 120"><circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="3"/><circle class="p" cx="60" cy="60" r="50" fill="none" stroke="${ACC}" stroke-width="3" stroke-linecap="round" stroke-dasharray="314.16" stroke-dashoffset="314.16" transform="rotate(-90 60 60)"/></svg>`, { left: '1660px', top: '402px' });
  ui.arcP = ui.arc.querySelector('.p');
  // end card
  ui.word = el(r, 'VYTA', { left: 0, width: '1920px', textAlign: 'center', top: '730px', font: '700 150px/1 "Unbounded"', letterSpacing: '.32em', textIndent: '.32em' });
  ui.wordL = split(ui.word);
  ui.tag = el(r, 'Know your body.', { left: 0, width: '1920px', textAlign: 'center', top: '905px', font: 'italic 400 46px "Instrument Serif"', color: 'rgba(255,255,255,.85)' });
  ui.tagL = split(ui.tag);
};

S.update = (t) => {
  const d = S.dur;
  // highlight sweep: rotate the environment
  scene.environmentRotation.set(0, -0.6 + t * 0.12, 0);
  let bloomS = 0.55;
  let ecgP = 0, ecgOp = 0;
  if (t < 4) {
    // Shot A: macro along the band
    const u = E.ioSine(seg(t, 0, 4));
    ringG.position.set(0, 0, 0);
    ringG.rotation.set(1.05, 0, -0.25);
    ring.rotation.y = -1.2 + u * 0.9;
    lookCam(cam, mix([2.9, 0.9, 2.2], [2.1, 0.25, 2.8], u), mix([0.55, -0.15, 0.2], [0.35, -0.05, 0.1], u), 0.08 - 0.05 * u);
    cam.fov = 26; ecgOp = 0;
  } else {
    // Shot B -> C: upright hero, then settle up for the end card
    const tb = t - 4;
    const up = E.io5(seg(t, 8.0, 9.4));
    ringG.rotation.set(Math.PI / 2 - 0.12 + up * 0.38, 0, 0.0);
    ring.rotation.y = 0;
    ringG.rotation.z = 0;
    ring.rotation.y = 0.5 - tb * 0.09;  // slow spin about the ring axis (sensor travel)
    ringG.rotation.y = lerp(-0.55, 0.35, E.ioSine(seg(t, 4, 9.4))) + up * 0.0;
    ringG.position.set(0, lerp(0, 0.62, up), 0);
    const z = lerp(6.3, 5.5, E.ioSine(seg(t, 4, 8))) + up * 1.6;
    lookCam(cam, [lerp(-0.3, 0.15, seg(t, 4, 12)), lerp(0.05, 0.25, up), z], [0, lerp(0, 0.25, up), 0]);
    cam.fov = 30;
    ecgP = E.lin(seg(t, 4.2, 8.6)); ecgOp = 1 - E.in2(seg(t, 8.6, 9.4));
  }
  cam.updateProjectionMatrix();
  // ECG reveal
  const segs = Math.floor(ecgP * ecgN);
  ecg.geometry.instanceCount = Math.max(1, segs);
  ecg.material.opacity = ecgOp; ecg.visible = ecgOp > 0.01 && segs > 1;
  const hi = Math.min(segs, ecgN) * 3; head.position.set(ecg.pts[hi], ecg.pts[hi + 1], ecg.pts[hi + 2]);
  head.material.opacity = ecgOp * (ecgP > 0 && ecgP < 1 ? 1 : 0); head.visible = head.material.opacity > 0.01;
  // LED pulse with the heartbeat (62 bpm)
  const beat = Math.exp(-(((((t * 62 / 60) % 1) - 0.3) / 0.08) ** 2));
  leds.forEach((l, i) => { if (l.isSprite) l.material.opacity = 0.35 + 0.65 * beat; });
  // backdrop glow breathing
  bd.u.g1.value.w = 0.85 + 0.25 * beat * (t > 4 ? 1 : 0.3);
  bd.u.g1.value.y = t < 4 ? 0.62 : lerp(0.5, 0.62, E.io5(seg(t, 8, 9.4)));

  // ---- overlay
  H(t, d);
  ui.facts.forEach((L, i) => letters(L, t, 0.6 + i * 0.75, { stagger: .028, dur: .7, y: 50, blur: 18, out: 3.45, outDur: .3, outStagger: .01 }));
  const cs = [ui.c1, ui.c4, ui.c2, ui.c3];
  cs.forEach((c, i) => {
    const a = 4.7 + i * 0.45, p = env(t, a, 8.25 + i * 0.05, .8, .35);
    show(c.box, p, { y: 0, x: (i < 2 ? -40 : 40), blur: 14 });
    c.ln.style.transform = `scaleX(${E.out4(seg(t, a, a + .8)).toFixed(3)})`;
  });
  // live numbers
  const hr = Math.round(lerp(48, 62, E.out3(seg(t, 4.7, 6))) + (t > 6 ? Math.round(Math.sin(t * 2.1)) : 0));
  setText(ui.c1.vs, String(hr));
  setText(ui.c2.vs, String(Math.round(94 * E.out4(seg(t, 5.6, 7.2)))));
  setText(ui.c4.vs, (41.2 * E.out4(seg(t, 5.15, 6.6))).toFixed(1));
  const sl = E.out4(seg(t, 6.05, 7.5)) * 462; setText(ui.c3.vs, `${Math.floor(sl / 60)}:${String(Math.floor(sl % 60)).padStart(2, '0')}`);
  show(ui.arc, env(t, 5.6, 8.4, .6, .35), { y: 0, blur: 8, scale: 0.2 });
  ui.arcP.setAttribute('stroke-dashoffset', (314.16 * (1 - 0.94 * E.out4(seg(t, 5.6, 7.2)))).toFixed(2));
  // end card
  ui.word.style.letterSpacing = `${lerp(0.55, 0.32, E.out5(seg(t, 8.9, 11.5))).toFixed(4)}em`;
  letters(ui.wordL, t, 8.95, { stagger: .07, dur: 1.1, y: 0, blur: 30 });
  letters(ui.tagL, t, 9.7, { stagger: .02, dur: .8, y: 24, blur: 12 });
  return { scene, camera: cam, bloom: [bloomS, 0.55, 0.82], exposure: 1.05, grain: 0.1 };
};
export default S;
