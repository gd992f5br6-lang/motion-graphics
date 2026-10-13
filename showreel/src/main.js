import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { clamp, seg, E } from './lib.js';
import { SCENES } from './timeline.js';

const W = 1920, H = 1080, FPS = 30;
const RENDER = location.search.includes('render');
document.body.classList.add(RENDER ? 'render' : 'preview');
const $ = id => document.getElementById(id);

const renderer = new THREE.WebGLRenderer({ canvas: $('gl'), antialias: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;

const QP = new URLSearchParams(location.search);
const rt = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: +(QP.get('msaa') ?? 4) });
const composer = new EffectComposer(renderer, rt);
const rpass = new RenderPass(new THREE.Scene(), new THREE.PerspectiveCamera());
const bloom = new UnrealBloomPass(new THREE.Vector2(W, H), 0.5, 0.6, 0.85);
composer.addPass(rpass); if (QP.get('bloom') !== '0') composer.addPass(bloom); composer.addPass(new OutputPass());

await document.fonts.ready;
await Promise.all(['400 40px "Instrument Serif"', 'italic 400 40px "Instrument Serif"', '700 40px Unbounded', '600 40px "Space Grotesk"',
  '500 40px Fraunces', 'italic 400 40px Fraunces', '500 40px "JetBrains Mono"', '600 40px "Inter Tight"', '800 40px "Inter Tight"'].map(f => document.fonts.load(f)));

const ui = $('ui');
const ctx = { renderer, W, H, FPS };
let t0 = 0;
for (const s of SCENES) {
  s.start = t0; t0 += s.dur;
  s.root = document.createElement('div'); s.root.className = 'scene'; ui.appendChild(s.root);
  ctx.root = s.root;
  await s.init(ctx);
}
const DURATION = t0;

// --- film grain: a few pre-baked noise frames, cycled
const gctx = $('grain').getContext('2d');
const grains = [];
for (let k = 0; k < 6; k++) {
  const id = gctx.createImageData(W, H); const d = id.data; let s = 1234 + k * 999;
  for (let i = 0; i < d.length; i += 4) { s = (s * 16807) % 2147483647; const v = (s & 255); d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
  grains.push(id);
}
let lastGrain = -1;

// --- transitions: light leak + flash on every scene boundary
const leak = $('leak'), flash = $('flash');
function transitions(t) {
  let lo = 0, fo = 0, col = '#fff', x = 0;
  for (let i = 1; i < SCENES.length; i++) {
    const B = SCENES[i].start, c = SCENES[i].accent || '#ffffff';
    const p = seg(t, B - 0.3, B + 0.3);
    if (p > 0 && p < 1) {
      lo = 0.9 * Math.sin(Math.PI * p) ** 2; col = c; x = -110 + 220 * E.io3(p);
    }
    const f = Math.exp(-(((t - B) / (t < B ? 0.045 : 0.075)) ** 2));
    if (f > fo) { fo = f; }
  }
  if (lo > 0.002) {
    leak.style.opacity = lo.toFixed(3);
    leak.style.background = `linear-gradient(100deg, transparent 0%, ${col}00 30%, ${col} 45%, #fff 50%, ${col} 55%, ${col}00 70%, transparent 100%)`;
    leak.style.transform = `translateX(${x.toFixed(2)}%)`;
  } else leak.style.opacity = 0;
  flash.style.opacity = fo > 0.002 ? fo.toFixed(3) : 0;
  flash.style.background = col;
}

let cur = null;
function seek(t) {
  t = clamp(t, 0, DURATION - 1e-6);
  let s = SCENES[SCENES.length - 1];
  for (const x of SCENES) if (t >= x.start && t < x.start + x.dur) { s = x; break; }
  if (cur !== s) { if (cur) cur.root.style.display = 'none'; s.root.style.display = 'block'; cur = s; }
  const f = s.update(t - s.start, ctx);
  rpass.scene = f.scene; rpass.camera = f.camera;
  const b = f.bloom || [0.5, 0.6, 0.85];
  bloom.strength = b[0]; bloom.radius = b[1]; bloom.threshold = b[2];
  renderer.toneMappingExposure = f.exposure ?? 1;
  composer.render();
  transitions(t);
  const gi = Math.floor(t * FPS + 1e-4) % grains.length;
  if (gi !== lastGrain) { gctx.putImageData(grains[gi], 0, 0); lastGrain = gi; }
  $('grain').style.opacity = (f.grain ?? 0.1).toFixed(3);
  $('vignette').style.opacity = (f.vignette ?? 1).toFixed(3);
}
if (QP.get('fx') === '0') $('fx').style.display = 'none';
if (QP.get('ui') === '0') $('ui').style.display = 'none';
window.seek = seek; window.DURATION = DURATION; window.SCENES = SCENES.map(s => ({ name: s.name, start: s.start, dur: s.dur }));
seek(0);
window.READY = true;

if (!RENDER) {
  const wrap = $('wrap');
  const fit = () => { const k = Math.min(innerWidth / W, (innerHeight - 34) / H); wrap.style.transform = `translate(${(innerWidth - W * k) / 2}px,0) scale(${k})`; };
  fit(); addEventListener('resize', fit);
  const q = new URLSearchParams(location.search);
  let playing = !q.has('pause'), pos = +(q.get('t') || 0), last = performance.now();
  const scrub = $('scrub');
  scrub.oninput = () => { pos = scrub.value * DURATION; seek(pos); };
  addEventListener('keydown', e => {
    if (e.code === 'Space') playing = !playing;
    if (e.code === 'ArrowRight') pos += 1; if (e.code === 'ArrowLeft') pos -= 1;
    pos = clamp(pos, 0, DURATION); seek(pos);
  });
  const loop = (now) => {
    if (playing) { pos += (now - last) / 1000; if (pos >= DURATION) pos = 0; seek(pos); scrub.value = pos / DURATION; }
    last = now; const s = Math.floor(pos), fr = Math.floor((pos - s) * FPS);
    $('tc').textContent = `00:${String(s).padStart(2, '0')}:${String(fr).padStart(2, '0')}`;
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}
