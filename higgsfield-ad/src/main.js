import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { clamp } from './lib.js';
import { LookShader } from './look.js';
import { SECTIONS } from './timeline.js';

const W = 1080, H = 1920, FPS = 30;
const RENDER = location.search.includes('render');
document.body.classList.add(RENDER ? 'render' : 'preview');
const $ = id => document.getElementById(id);

const renderer = new THREE.WebGLRenderer({ canvas: $('gl'), antialias: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.autoClear = true;

// ---- shots: each window on screen is its own little camera + grade pipeline
const pipes = new Map();
function pipe(key, w, h) {
  let p = pipes.get(key);
  if (p && p.w === w && p.h === h) return p;
  const rt = new THREE.WebGLRenderTarget(w, h, { type: THREE.HalfFloatType, samples: 4 });
  const c = new EffectComposer(renderer, rt); c.renderToScreen = false; c.setPixelRatio(1); c.setSize(w, h);
  const rp = new RenderPass(new THREE.Scene(), new THREE.PerspectiveCamera());
  const bl = new UnrealBloomPass(new THREE.Vector2(w, h), 0.4, 0.6, 0.85);
  const lp = new ShaderPass(LookShader); lp.uniforms.res.value = [w, h];
  c.addPass(rp); c.addPass(bl); c.addPass(new OutputPass()); c.addPass(lp);
  p = { w, h, c, rp, bl, lp }; pipes.set(key, p); return p;
}
let FRAME = 0;
const LOOK_DEF = { ai: 0, warp: 0, split: -1, grain: 0.075, halation: 0.55, lift: 0.035, sat: 0.9, weave: 1, vign: 0.35 };
function shot(key, scene, cam, w, h, o = {}) {
  const p = pipe(key, w, h);
  cam.aspect = w / h; cam.updateProjectionMatrix();
  p.rp.scene = scene; p.rp.camera = cam;
  const b = o.bloom || [0.45, 0.6, 0.85]; p.bl.strength = b[0]; p.bl.radius = b[1]; p.bl.threshold = b[2];
  const L = { ...LOOK_DEF, ...o };
  for (const k of Object.keys(LOOK_DEF)) p.lp.uniforms[k].value = L[k];
  p.lp.uniforms.frame.value = FRAME;
  renderer.toneMappingExposure = o.exposure ?? 1;
  p.c.render();
  return p.c.readBuffer.texture;
}

// ---- display: rounded quads on an orthographic stage, pixels with y down
const disp = new THREE.Scene();
const ortho = new THREE.OrthographicCamera(0, W, 0, -H, -10, 10);
const quadG = new THREE.PlaneGeometry(1, 1);
const pool = []; let used = 0;
function quad() {
  if (used < pool.length) return pool[used++];
  const m = new THREE.Mesh(quadG, new THREE.ShaderMaterial({
    transparent: true, depthTest: false, depthWrite: false,
    uniforms: { tex: { value: null }, size: { value: [1, 1] }, radius: { value: 0 }, opacity: { value: 1 }, dim: { value: 0 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `uniform sampler2D tex; uniform vec2 size; uniform float radius, opacity, dim; varying vec2 vUv;
      void main(){ vec2 p=(vUv-.5)*size; vec2 q=abs(p)-size*.5+radius; float d=length(max(q,0.))+min(max(q.x,q.y),0.)-radius;
        float a=clamp(.5-d,0.,1.); vec3 c=texture2D(tex,vUv).rgb*(1.-dim); gl_FragColor=vec4(c, a*opacity); }`,
  }));
  m.frustumCulled = false; disp.add(m); pool.push(m); used++; return m;
}
function place(tex, x, y, w, h, o = {}) {
  const m = quad(); m.visible = true;
  m.position.set(x + w / 2, -(y + h / 2), 0); m.scale.set(w, h, 1); m.rotation.z = o.rot || 0;
  const u = m.material.uniforms; u.tex.value = tex; u.size.value = [w, h]; u.radius.value = o.radius || 0; u.opacity.value = o.opacity ?? 1; u.dim.value = o.dim || 0;
  m.renderOrder = o.z || used;
}

await document.fonts.ready;
await Promise.all(['800 40px "TikTok Sans"', '600 40px "TikTok Sans"', '400 40px "Instrument Serif"', 'italic 400 40px "Instrument Serif"', '500 40px "JetBrains Mono"', '600 40px "Inter Tight"'].map(f => document.fonts.load(f)));

const ctx = { renderer, W, H, FPS, shot, place };
let t0 = 0;
for (const s of SECTIONS) {
  s.start = t0; t0 += s.dur;
  s.root = document.createElement('div'); s.root.className = 'sec'; $('ui').appendChild(s.root);
  ctx.root = s.root; await s.init(ctx);
}
const DURATION = t0;

let cur = null;
function seek(t) {
  t = clamp(t, 0, DURATION - 1e-6);
  FRAME = Math.round(t * FPS);
  let s = SECTIONS[SECTIONS.length - 1];
  for (const x of SECTIONS) if (t >= x.start && t < x.start + x.dur) { s = x; break; }
  if (cur !== s) { if (cur) cur.root.style.display = 'none'; s.root.style.display = 'block'; cur = s; }
  used = 0;
  const f = s.update(t - s.start, ctx, t) || {};
  for (let i = used; i < pool.length; i++) pool[i].visible = false;
  renderer.setRenderTarget(null);
  renderer.setClearColor(f.bg || '#000', 1); renderer.clear();
  renderer.render(disp, ortho);
}
window.seek = seek; window.DURATION = DURATION;
seek(0); window.READY = true;

if (!RENDER) {
  const wrap = $('wrap');
  const fit = () => { const k = Math.min(innerWidth / W, (innerHeight - 34) / H); wrap.style.transform = `translate(${(innerWidth - W * k) / 2}px,0) scale(${k})`; };
  fit(); addEventListener('resize', fit);
  const q = new URLSearchParams(location.search);
  let playing = !q.has('pause'), pos = +(q.get('t') || 0), last = performance.now();
  $('scrub').oninput = () => { pos = $('scrub').value * DURATION; seek(pos); };
  $('safeT').onchange = e => document.body.classList.toggle('safe', e.target.checked);
  addEventListener('keydown', e => { if (e.code === 'Space') playing = !playing; if (e.code === 'ArrowRight') pos += 1; if (e.code === 'ArrowLeft') pos -= 1; pos = clamp(pos, 0, DURATION); seek(pos); });
  const loop = now => { if (playing) { pos += (now - last) / 1000; if (pos >= DURATION) pos = 0; seek(pos); $('scrub').value = pos / DURATION; }
    last = now; const s = Math.floor(pos); $('tc').textContent = `00:${String(s).padStart(2, '0')}:${String(Math.floor((pos - s) * FPS)).padStart(2, '0')}`; requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
}
