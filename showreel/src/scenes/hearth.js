// 04 Family — hearth, the family hub
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { el, split, letters, show, env, seg, E, lerp, mix, rnd } from '../lib.js';
import { backdrop, canvasTex, roundRect, roundedSlab, lookCam } from '../gl.js';
import { hud } from '../ui.js';

const ACC = '#e0764f', INK = '#2b211a';
const S = { name: 'hearth', dur: 12, accent: '#ffb48a' };
let scene, cam, dev, screenM, cards = [], H, ui = {}, sun;
const SERIF = '"Fraunces"', SANS = '"Inter Tight"';

function avatar(g, x, y, r, col, ch) {
  g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
  g.fillStyle = '#fff'; g.font = `600 ${r * 0.95}px ${SANS}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(ch, x, y + r * 0.04);
  g.textAlign = 'left'; g.textBaseline = 'alphabetic';
}
function cardTex(kind) {
  return canvasTex(1024, 640, (g, w, h) => {
    g.fillStyle = '#fffaf4'; g.fillRect(0, 0, w, h);
    g.fillStyle = INK;
    const label = (s, y = 92) => { g.font = `600 30px ${SANS}`; g.letterSpacing = '4px'; g.fillStyle = 'rgba(43,33,26,.45)'; g.fillText(s, 70, y); g.letterSpacing = '0px'; g.fillStyle = INK; };
    if (kind === 0) {
      label('TODAY · 16:30'); avatar(g, 140, 300, 72, '#e98a8a', 'M');
      g.font = `500 64px ${SERIF}`; g.fillText('Piano lesson', 250, 290); g.font = `400 36px ${SANS}`; g.fillStyle = 'rgba(43,33,26,.6)'; g.fillText('Mia · Music school', 252, 345);
      g.fillStyle = '#f3e3d3'; roundRect(g, 70, 450, 884, 110, 55); g.fill(); g.fillStyle = ACC; roundRect(g, 70, 450, 560, 110, 55); g.fill();
      g.fillStyle = '#fff'; g.font = `600 38px ${SANS}`; g.fillText('Dad is driving  →', 120, 518);
    } else if (kind === 1) {
      label('SATURDAY · 18:00'); g.font = `500 76px ${SERIF}`; g.fillText('Grandma’s 70th', 70, 250);
      g.font = '80px "Noto Color Emoji"'; g.fillText('🎂', 820, 260);
      ['#7aa6d8', '#e98a8a', '#9fbf8f', '#e6b45a', '#b79ad6'].forEach((c, i) => { g.strokeStyle = '#fffaf4'; g.lineWidth = 10; g.beginPath(); g.arc(130 + i * 82, 420, 58, 0, 7); g.stroke(); avatar(g, 130 + i * 82, 420, 54, c, 'LMAJK'[i]); });
      g.font = `500 40px ${SANS}`; g.fillStyle = 'rgba(43,33,26,.65)'; g.fillText('12 going', 560, 434);
    } else if (kind === 2) {
      label('WEEKEND SHOP · 3 LEFT'); g.font = `500 64px ${SERIF}`; g.fillText('Shopping list', 70, 200);
      ['Berries', 'Fresh pasta', 'Oat milk'].forEach((s, i) => {
        const y = 300 + i * 100, done = i === 0;
        g.strokeStyle = done ? '#9fbf8f' : 'rgba(43,33,26,.3)'; g.lineWidth = 6; roundRect(g, 74, y - 40, 56, 56, 16); g.stroke();
        if (done) { g.fillStyle = '#9fbf8f'; roundRect(g, 74, y - 40, 56, 56, 16); g.fill(); g.strokeStyle = '#fff'; g.beginPath(); g.moveTo(88, y - 12); g.lineTo(100, y); g.lineTo(118, y - 26); g.stroke(); }
        g.fillStyle = done ? 'rgba(43,33,26,.4)' : INK; g.font = `500 44px ${SANS}`; g.fillText(s, 160, y);
      });
    } else if (kind === 3) {
      // illustrated memory: lake at sunset
      const sky = g.createLinearGradient(0, 0, 0, h); sky.addColorStop(0, '#f7b98b'); sky.addColorStop(.55, '#fcdcb4'); sky.addColorStop(1, '#f0c8a0');
      g.fillStyle = sky; g.fillRect(0, 0, w, h);
      g.fillStyle = '#fff3dc'; g.beginPath(); g.arc(640, 300, 90, 0, 7); g.fill();
      g.fillStyle = '#d98f6e'; g.beginPath(); g.moveTo(0, 360); for (let x = 0; x <= w; x += 16) g.lineTo(x, 330 - Math.sin(x * .006) * 60 - Math.sin(x * .017) * 18); g.lineTo(w, 640); g.lineTo(0, 640); g.fill();
      g.fillStyle = '#b8735a'; g.beginPath(); g.moveTo(0, 420); for (let x = 0; x <= w; x += 16) g.lineTo(x, 400 - Math.sin(x * .004 + 1) * 40); g.lineTo(w, 640); g.lineTo(0, 640); g.fill();
      g.fillStyle = '#8fb3c4'; g.fillRect(0, 440, w, 200);
      g.fillStyle = 'rgba(255,243,220,.7)'; for (let i = 0; i < 9; i++) g.fillRect(560 + Math.sin(i) * 30, 460 + i * 18, 160 - i * 14, 5);
      g.fillStyle = 'rgba(255,255,255,.9)'; g.font = `600 30px ${SANS}`; g.letterSpacing = '3px'; g.fillText('MEMORIES · 248 PHOTOS', 60, 80); g.letterSpacing = '0px';
      g.font = `italic 500 60px ${SERIF}`; g.fillText('Summer at the lake', 60, 590);
    } else {
      label('08:02 · LOCATION'); avatar(g, 140, 300, 72, '#7aa6d8', 'L');
      g.font = `500 60px ${SERIF}`; g.fillText('Leo arrived', 250, 280); g.fillText('at school', 250, 350);
      g.fillStyle = '#9fbf8f'; g.beginPath(); g.arc(880, 300, 56, 0, 7); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 10; g.beginPath(); g.moveTo(852, 302); g.lineTo(872, 322); g.lineTo(910, 282); g.stroke();
      g.fillStyle = 'rgba(43,33,26,.5)'; g.font = `400 34px ${SANS}`; g.fillText('Shared with Mom & Dad', 70, 540);
    }
  });
}

S.init = (ctx) => {
  scene = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(ctx.renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.4;
  const BG = '#e9d9c6';
  scene.fog = new THREE.Fog(BG, 16, 42);
  const bd = backdrop({ c0: BG, c1: '#0d0703', g1: [0.62, 0.72, 0.5, 1], c2: '#000000', g2: [0, 0, 0.1, 0] });
  scene.add(bd);
  cam = new THREE.PerspectiveCamera(32, 16 / 9, 0.05, 100);

  scene.add(new THREE.HemisphereLight('#fff3e2', '#c9ab8a', 0.75));
  sun = new THREE.DirectionalLight('#ffd9b0', 4.6);
  sun.position.set(-6, 7, 5); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); sun.shadow.radius = 5; sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02;
  Object.assign(sun.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7, near: 1, far: 30 });
  scene.add(sun);
  // window mullions: invisible casters that throw a window pattern on the floor
  const ghost = new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false });
  for (let i = 0; i < 3; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.12, 6, 0.12), ghost); b.position.set(-4.2 + i * 1.9 * 0.55, 4.5, 2.8 + i * 1.0); b.rotation.set(0.0, 0.62, 0.2); b.castShadow = true; scene.add(b); }
  const bar = new THREE.Mesh(new THREE.BoxGeometry(5, 0.12, 0.12), ghost); bar.position.set(-3.6, 4.6, 3.7); bar.rotation.y = 0.62; bar.castShadow = true; scene.add(bar);

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshStandardMaterial({ color: '#ecdcc8', roughness: 0.9 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);

  // device: fabric base + tilted display
  dev = new THREE.Group(); scene.add(dev);
  const weave = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#808080'; g.fillRect(0, 0, w, h); for (let i = 0; i < w; i += 4) { g.fillStyle = i % 8 ? '#9a9a9a' : '#6a6a6a'; g.fillRect(i, 0, 2, h); g.fillRect(0, i, w, 2); } }, { linear: true, repeat: [14, 6] });
  const fabric = new THREE.MeshPhysicalMaterial({ color: '#aebba1', roughness: 0.95, sheen: 1, sheenColor: '#f5f1e6', sheenRoughness: 0.5, bumpMap: weave, bumpScale: 1.2 });
  const prof = []; for (let i = 0; i <= 24; i++) { const a = -Math.PI / 2 + i / 24 * Math.PI; prof.push(new THREE.Vector2(0.62 + Math.cos(a) * 0.2, 0.2 + Math.sin(a) * 0.2)); }
  prof.unshift(new THREE.Vector2(0, 0)); prof.push(new THREE.Vector2(0, 0.4));
  const base = new THREE.Mesh(new THREE.LatheGeometry(prof, 96), fabric); base.scale.set(1, 1.15, 0.72); base.castShadow = base.receiveShadow = true; dev.add(base);
  const body = new THREE.Mesh(roundedSlab(2.36, 1.5, 0.08, 0.14, 0.02, 4), new THREE.MeshPhysicalMaterial({ color: '#f4efe8', roughness: 0.35, clearcoat: 0.4 }));
  const scr = new THREE.Group(); scr.position.set(0, 1.18, 0.05); scr.rotation.x = -0.2; dev.add(scr);
  body.castShadow = true; scr.add(body);
  const uiTex = canvasTex(2048, 1290, (g, w, h) => {
    const bg = g.createLinearGradient(0, 0, w, h); bg.addColorStop(0, '#fff6ec'); bg.addColorStop(1, '#fbe3d0'); g.fillStyle = bg; g.fillRect(0, 0, w, h);
    g.fillStyle = INK; g.font = `300 210px ${SERIF}`; g.fillText('7:42', 120, 330);
    g.font = `italic 400 74px ${SERIF}`; g.fillText('Good morning, family.', 128, 460);
    g.font = `500 44px ${SANS}`; g.fillStyle = 'rgba(43,33,26,.55)'; g.fillText('Sunny · 18°  ·  Tuesday, 13 Oct', 130, 545);
    const items = [['07:55', 'School run', 'Dad', '#7aa6d8'], ['16:30', 'Piano · Mia', 'Mom', '#e98a8a'], ['19:00', 'Family dinner', 'Everyone', '#9fbf8f']];
    g.fillStyle = 'rgba(255,255,255,.75)'; roundRect(g, 1180, 110, 760, 640, 56); g.fill();
    g.fillStyle = 'rgba(43,33,26,.45)'; g.font = `600 34px ${SANS}`; g.letterSpacing = '5px'; g.fillText('TODAY', 1250, 200); g.letterSpacing = '0px';
    items.forEach(([tm, n, who, c], i) => { const y = 310 + i * 150; g.fillStyle = c; roundRect(g, 1250, y - 60, 12, 100, 6); g.fill(); g.fillStyle = INK; g.font = `500 52px ${SANS}`; g.fillText(n, 1300, y); g.fillStyle = 'rgba(43,33,26,.5)'; g.font = `400 38px ${SANS}`; g.fillText(`${tm} · ${who}`, 1300, y + 50); });
    ['#e98a8a', '#7aa6d8', '#e6b45a', '#9fbf8f'].forEach((c, i) => avatar(g, 190 + i * 150, 900, 62, c, 'MLAJ'[i]));
    g.fillStyle = '#9fbf8f'; g.beginPath(); g.arc(800, 900, 16, 0, 7); g.fill(); g.fillStyle = INK; g.font = `500 46px ${SANS}`; g.fillText('Everyone’s home', 836, 916);
    g.fillStyle = ACC; roundRect(g, 120, 1060, 600, 120, 60); g.fill(); g.fillStyle = '#fff'; g.font = `600 46px ${SANS}`; g.fillText('＋  Add to family', 180, 1136);
  });
  screenM = new THREE.MeshPhysicalMaterial({ color: '#000000', roughness: 0.3, clearcoat: 0.35, clearcoatRoughness: 0.05, envMapIntensity: 0.4, emissive: '#ffffff', emissiveMap: uiTex, emissiveIntensity: 0 });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.386), screenM); screen.position.z = 0.0405; scr.add(screen);
  dev.scr = scr;

  // floating cards
  const FINAL = [[-2.75, 2.25, 0.2, 0.18], [2.8, 2.35, 0.0, -0.2], [-3.05, 0.95, 1.0, 0.28], [3.05, 1.05, 1.0, -0.3], [0.05, 2.95, -0.6, 0]];
  for (let k = 0; k < 5; k++) {
    const g = new THREE.Group();
    const slab = new THREE.Mesh(roundedSlab(1.6, 1.0, 0.03, 0.09, 0.008, 3), new THREE.MeshPhysicalMaterial({ color: '#fffaf4', roughness: 0.6 }));
    slab.castShadow = true; g.add(slab);
    const face = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.0), new THREE.MeshStandardMaterial({ map: cardTex(k), roughness: 0.55 }));
    face.position.z = 0.0155; g.add(face);
    // round the printed face's corners with an alpha mask
    face.material.alphaMap = canvasTex(256, 160, (q, w, h) => { q.fillStyle = '#000'; q.fillRect(0, 0, w, h); q.fillStyle = '#fff'; roundRect(q, 0, 0, w, h, 14); q.fill(); }, { linear: true });
    face.material.transparent = true;
    g.final = FINAL[k]; scene.add(g); cards.push(g);
  }

  // ---- overlay
  const r = ctx.root;
  H = hud(r, { num: '04', cat: 'Family', product: 'hearth · The Family Hub', accent: ACC, fg: INK, dim: 'rgba(43,33,26,.55)' });
  ui.l1 = el(r, 'Every plan.', { left: '96px', top: '700px', font: `400 112px/1 ${SERIF}`, color: INK, letterSpacing: '-.02em' });
  ui.l2 = el(r, 'Every moment.', { left: '96px', top: '820px', font: `italic 400 112px/1 ${SERIF}`, color: ACC, letterSpacing: '-.02em' });
  ui.l1L = split(ui.l1); ui.l2L = split(ui.l2);
  ui.veil = el(r, '', { left: 0, top: '540px', width: '1920px', height: '540px', background: 'linear-gradient(to bottom, rgba(233,217,198,0), rgba(233,217,198,.94) 62%)' });
  ui.word = el(r, 'hearth', { left: 0, width: '1920px', textAlign: 'center', top: '742px', font: `500 176px/1 ${SERIF}`, color: INK, letterSpacing: '-.035em', fontVariationSettings: '"SOFT" 100, "WONK" 1' });
  ui.wordL = split(ui.word);
  ui.dot = document.createElement('span'); Object.assign(ui.dot.style, { display: 'inline-block', width: '30px', height: '30px', borderRadius: '50%', background: ACC, marginLeft: '14px', verticalAlign: '4px' }); ui.word.appendChild(ui.dot);
  ui.tag = el(r, 'Every moment, together.', { left: 0, width: '1920px', textAlign: 'center', top: '944px', font: `italic 400 44px ${SERIF}`, color: 'rgba(43,33,26,.8)' });
  ui.tagL = split(ui.tag);
};

S.update = (t) => {
  const d = S.dur;
  const wake = E.out3(seg(t, 0.5, 1.6));
  screenM.emissiveIntensity = 0.03 + 1.05 * wake;
  if (t < 4) {
    const u = E.ioSine(seg(t, 0, 4));
    lookCam(cam, mix([2.2, 1.0, 6.4], [1.0, 1.25, 4.9], u), mix([0.3, 1.0, 0], [0.1, 1.1, 0], u));
    cam.fov = 32;
  } else {
    const u = E.io3(seg(t, 4, 8)), v = E.io3(seg(t, 8, 12));
    const pos = mix(mix([1.8, 1.5, 6.0], [0, 1.9, 9.6], u), [-0.9, 2.6, 10.6], v);
    lookCam(cam, pos, mix([0.0, 1.25, 0], [0, 0.55, 0], v));
    cam.fov = 32;
  }
  cam.updateProjectionMatrix();
  cards.forEach((c, k) => {
    const a = 4.25 + k * 0.22, p = E.out4(seg(t, a, a + 1.4));
    const [fx, fy, fz, ry] = c.final;
    const src = [0, 1.18, 0.3];
    const bob = Math.sin(t * 1.1 + k * 1.7) * 0.06 * p;
    c.position.set(lerp(src[0], fx, p), lerp(src[1], fy, p) + bob + Math.sin(Math.PI * p) * 0.35, lerp(src[2], fz, p) + Math.sin(Math.PI * p) * 0.8);
    c.rotation.set(-0.06 + Math.sin(t * 0.8 + k) * 0.03, ry * p + Math.sin(t * 0.7 + k * 2) * 0.04, Math.sin(Math.PI * p) * (k % 2 ? 0.25 : -0.25));
    c.scale.setScalar(lerp(0.15, 1, p));
    c.visible = p > 0.001;
  });

  // ---- overlay
  H(t, d);
  letters(ui.l1L, t, 0.7, { stagger: .03, dur: .9, y: 60, blur: 16, out: 3.4, outDur: .3, outStagger: .01 });
  letters(ui.l2L, t, 1.15, { stagger: .03, dur: .9, y: 60, blur: 16, out: 3.45, outDur: .3, outStagger: .01 });
  show(ui.veil, E.io3(seg(t, 8.6, 10)), { y: 0, blur: 0 });
  letters(ui.wordL, t, 9.2, { stagger: .07, dur: 1.1, y: 50, blur: 24 });
  show(ui.dot, E.outBack(seg(t, 9.85, 10.5), 2.2), { y: 0, blur: 4, scale: 1 });
  letters(ui.tagL, t, 9.9, { stagger: .02, dur: .8, y: 20, blur: 10 });
  return { scene, camera: cam, bloom: [0.12, 0.4, 0.95], exposure: 0.95, grain: 0.07, vignette: 0.3 };
};
export default S;
