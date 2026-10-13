// 06 Outro — the five marks, then the sign-off
import * as THREE from 'three';
import { el, split, letters, show, env, seg, E, rnd, lerp } from '../lib.js';
import { backdrop } from '../gl.js';

const S = { name: 'outro', dur: 7, accent: '#ffffff' };
let scene, cam, pts, ui = {};
const MARKS = [
  ['VYTA', '700 64px Unbounded', '.18em', '#ffffff', 'Fitness & Health', '#ff4b36'],
  ['VELORA', "400 72px 'Instrument Serif'", '.22em', '#f3dfb0', 'Finance & Commerce', '#e6c27a'],
  ['QORE', "700 70px 'Space Grotesk'", '-.02em', '#ffffff', 'Technology', '#39e6ff'],
  ['hearth', '500 76px Fraunces', '-.03em', '#f6e7d8', 'Family', '#e0764f'],
  ['NOCTIS+', "800 66px 'Inter Tight'", '-.04em', '#ffffff', 'Media & Entertainment', '#c04dff'],
];

S.init = (ctx) => {
  scene = new THREE.Scene();
  cam = new THREE.PerspectiveCamera(40, 16 / 9, 0.1, 100);
  scene.add(backdrop({ c0: '#030304', c1: '#12101a', g1: [0.5, 0.5, 0.6, 1], c2: '#000', g2: [0, 0, .1, 0] }));
  const N = 450, pos = new Float32Array(N * 3), size = new Float32Array(N);
  for (let i = 0; i < N; i++) { pos[i * 3] = (rnd(i + 5) - .5) * 30; pos[i * 3 + 1] = (rnd(i + 91) - .5) * 18; pos[i * 3 + 2] = -rnd(i + 17) * 30 + 6; size[i] = 0.25 + rnd(i + 33) ** 4 * 3; }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('size', new THREE.BufferAttribute(size, 1));
  pts = new THREE.Points(g, new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { op: { value: 1 } },
    vertexShader: `attribute float size; varying float vB; void main(){ vec4 mv=modelViewMatrix*vec4(position,1.); float d=-mv.z; float coc=abs(d-9.)*0.9+1.; vB=1./(coc*coc*0.35+0.65); gl_PointSize=min(size*coc*144./d,150.); gl_Position=projectionMatrix*mv; }`,
    fragmentShader: `varying float vB; uniform float op; void main(){ float r=length(gl_PointCoord-.5); gl_FragColor=vec4(vec3(1.,.96,.92)*smoothstep(.5,.38,r)*vB*op*0.11,1.); }`,
  }));
  scene.add(pts);
  const r = ctx.root;
  ui.row = el(r, MARKS.map(([w, f, ls, c, cat, acc]) => `<div style="display:flex;flex-direction:column;align-items:center;gap:26px"><div style="font:${f};letter-spacing:${ls};color:${c};line-height:1;height:80px;display:flex;align-items:center">${w}</div><div style="font:500 13px 'JetBrains Mono';letter-spacing:.22em;color:rgba(255,255,255,.55);text-transform:uppercase"><span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${acc};margin-right:10px;vertical-align:1px"></span>${cat}</div></div>`).join(''),
    { left: 0, width: '1920px', top: '450px', display: 'flex', justifyContent: 'center', gap: '96px' });
  ui.marks = [...ui.row.children];
  ui.l1 = el(r, 'Your brand is next.', { left: 0, width: '1920px', textAlign: 'center', top: '400px', font: '400 150px/1 "Instrument Serif"', letterSpacing: '-.01em' });
  ui.l1L = split(ui.l1);
  ui.sub = el(r, 'MOTION DESIGN&nbsp;&nbsp;·&nbsp;&nbsp;3D PRODUCT FILM&nbsp;&nbsp;·&nbsp;&nbsp;BRAND CAMPAIGNS', { left: 0, width: '1920px', textAlign: 'center', top: '600px', font: '500 16px "JetBrains Mono"', letterSpacing: '.42em', textIndent: '.42em', color: 'rgba(255,255,255,.66)' });
  ui.line = el(r, '', { left: '885px', top: '668px', width: '150px', height: '1px', background: 'rgba(255,255,255,.5)' });
  ui.cta = el(r, 'LET’S CREATE YOURS', { left: 0, width: '1920px', textAlign: 'center', top: '700px', font: '600 15px "JetBrains Mono"', letterSpacing: '.42em', textIndent: '.42em', color: '#fff' });
  ui.black = el(r, '', { left: 0, top: 0, width: '1920px', height: '1080px', background: '#000' });
};

S.update = (t) => {
  cam.position.set(Math.sin(t * .2) * .3, Math.cos(t * .17) * .15, lerp(6, 3.5, E.ioSine(seg(t, 0, 7)))); cam.lookAt(0, 0, -10);
  pts.material.uniforms.op.value = 1;
  ui.marks.forEach((m, i) => show(m, env(t, 0.35 + i * 0.16, 3.2 + i * 0.05, .9, .35), { y: 40, blur: 18 }));
  letters(ui.l1L, t, 3.75, { stagger: .03, dur: 1.0, y: 60, blur: 22 });
  show(ui.sub, env(t, 4.5, null, .8), { y: 14, blur: 8 });
  ui.line.style.transform = `scaleX(${E.out5(seg(t, 4.8, 5.8)).toFixed(4)})`;
  show(ui.cta, env(t, 5.0, null, .8), { y: 10, blur: 8 });
  ui.black.style.opacity = E.io3(seg(t, 6.25, 6.95)).toFixed(3);
  return { scene, camera: cam, bloom: [0.5, 0.6, 0.4], exposure: 1, grain: 0.11 };
};
export default S;
