// 00 Intro: drifting bokeh dust, title card.
import * as THREE from 'three';
import { el, split, letters, show, env, seg, E, rnd, lerp } from '../lib.js';
import { backdrop } from '../gl.js';

const S = { name: 'intro', dur: 4, accent: '#ff5a43' };
let scene, cam, pts, bd, ui = {};
const COLORS = ['#ff5a43', '#e8c987', '#38e8ff', '#f2a37a', '#b65cff'];

S.init = (ctx) => {
  scene = new THREE.Scene();
  cam = new THREE.PerspectiveCamera(40, 16 / 9, 0.1, 100);
  bd = backdrop({ c0: '#040405', c1: '#141018', g1: [0.5, 0.55, 0.7, 1], c2: '#0d0a08', g2: [0.8, 0.2, 0.4, 1] });
  scene.add(bd);
  // dust: soft round points at many depths
  const N = 600, pos = new Float32Array(N * 3), size = new Float32Array(N), col = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    pos[i * 3] = (rnd(i) - .5) * 30; pos[i * 3 + 1] = (rnd(i + 99) - .5) * 18; pos[i * 3 + 2] = -rnd(i + 7) * 30 + 6;
    size[i] = 0.25 + rnd(i + 3) ** 4 * 3;
    const c = new THREE.Color(rnd(i + 5) < .2 ? COLORS[Math.floor(rnd(i + 11) * 5)] : '#ffffff');
    col.set([c.r, c.g, c.b], i * 3);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('size', new THREE.BufferAttribute(size, 1));
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  pts = new THREE.Points(g, new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { op: { value: 1 }, focus: { value: 10 } },
    vertexShader: `attribute float size; attribute vec3 color; varying vec3 vC; varying float vB; uniform float focus;
      void main(){ vec4 mv=modelViewMatrix*vec4(position,1.); float d=-mv.z; float coc=abs(d-focus)*0.9+1.;
        vB=1./(coc*coc*0.35+0.65); vC=color; gl_PointSize=min(size*coc*144./d,150.); gl_Position=projectionMatrix*mv; }`,
    fragmentShader: `varying vec3 vC; varying float vB; uniform float op;
      void main(){ vec2 p=gl_PointCoord-.5; float r=length(p); float a=smoothstep(.5,.38,r); gl_FragColor=vec4(vC*a*vB*op*0.3,1.); }`,
  }));
  scene.add(pts);

  const r = ctx.root;
  ui.kicker = el(r, 'SHOWREEL&nbsp;&nbsp;·&nbsp;&nbsp;2026', { left: '0', width: '1920px', textAlign: 'center', top: '362px', font: '500 17px "JetBrains Mono"', letterSpacing: '.5em', color: 'rgba(255,255,255,.7)' });
  ui.kL = split(ui.kicker);
  ui.l1 = el(r, 'Five brands.', { left: '0', width: '1920px', textAlign: 'center', top: '418px', font: '400 150px/1 "Instrument Serif"', letterSpacing: '-.01em' });
  ui.l1L = split(ui.l1);
  ui.l2 = el(r, 'One standard.', { left: '0', width: '1920px', textAlign: 'center', top: '560px', font: 'italic 400 150px/1 "Instrument Serif"', letterSpacing: '-.01em', color: '#fff' });
  ui.l2L = split(ui.l2);
  ui.catRow = el(r, ['Fitness & Health', 'Finance & Commerce', 'Technology', 'Family', 'Media & Entertainment'].map((c, i) =>
    `<span style="display:inline-block"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${COLORS[i]};margin-right:12px;vertical-align:1px"></span>${c}</span>`).join(''),
    { left: '0', width: '1920px', top: '772px', display: 'flex', justifyContent: 'center', gap: '52px', font: '500 15px "JetBrains Mono"', letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,.75)' });
  ui.cats = [...ui.catRow.children];
  ui.line = el(r, '', { left: '660px', top: '742px', width: '600px', height: '1px', background: 'rgba(255,255,255,.35)', transformOrigin: '50% 50%' });
};

S.update = (t) => {
  const z = lerp(8, 4.5, E.io3(seg(t, 0, 4)));
  cam.position.set(Math.sin(t * .2) * .4, Math.cos(t * .17) * .2, z); cam.lookAt(0, 0, -10);
  pts.material.uniforms.focus.value = 9;
  pts.material.uniforms.op.value = E.out3(seg(t, 0, 1.2));
  const out = 3.25;
  letters(ui.kL, t, 0.15, { stagger: .02, dur: .6, y: 0, blur: 10, out, outDur: .3, outStagger: .005 });
  letters(ui.l1L, t, 0.35, { stagger: .035, dur: .9, y: 70, blur: 22, out: out - 0.05, outDur: .35, outStagger: .012 });
  letters(ui.l2L, t, 1.05, { stagger: .035, dur: .9, y: 70, blur: 22, out, outDur: .35, outStagger: .012 });
  ui.line.style.transform = `scaleX(${(E.out5(seg(t, 1.6, 2.4)) * (1 - E.in3(seg(t, out, out + .3)))).toFixed(4)})`;
  ui.cats.forEach((c, i) => show(c, env(t, 1.75 + i * .09, out + i * 0.03, .6, .25), { y: 18, blur: 8 }));
  return { scene, camera: cam, bloom: [0.6, 0.7, 0.35], exposure: 1, grain: 0.12 };
};
export default S;
