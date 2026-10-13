// Three cinematic "locations" built from depth layers + fog, so focal length and camera moves behave like real optics.
import * as THREE from 'three';
import { rnd, clamp } from './lib.js';
import { figure } from './figure.js';

function sky(o) {
  const u = { zen: { value: new THREE.Color(o.zen) }, hor: { value: new THREE.Color(o.hor) }, mid: { value: new THREE.Color(o.mid || o.hor) }, glow: { value: new THREE.Color(o.glow) }, sunC: { value: new THREE.Color(o.sunC) },
    sunDir: { value: new THREE.Vector3(...o.sun).normalize() }, sunSize: { value: o.sunSize ?? 0.012 }, below: { value: new THREE.Color(o.below || o.hor) },
    invProj: { value: new THREE.Matrix4() }, camW: { value: new THREE.Matrix4() }, glowK: { value: o.glowK ?? 1 } };
  const m = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
    uniforms: u, depthWrite: false, depthTest: false,
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,.9999,1.); }`,
    fragmentShader: `uniform vec3 zen,hor,mid,glow,sunC,below,sunDir; uniform float sunSize, glowK; uniform mat4 invProj, camW; varying vec2 vUv;
      void main(){ vec4 v=invProj*vec4(vUv*2.-1.,1.,1.); v/=v.w; vec3 d=normalize((camW*vec4(v.xyz,0.)).xyz);
        float e=d.y; vec3 c=mix(mix(hor, mid, smoothstep(-.01,.16,e)), zen, smoothstep(.08,.62,e)); if(e<0.) c=mix(hor,below,smoothstep(0.,-.08,e));
        float s=max(dot(d,sunDir),0.);
        c += glow*(pow(s,6.)*.55 + pow(s,40.)*.6)*glowK;
        float disk=smoothstep(cos(sunSize*1.15), cos(sunSize), dot(d,sunDir));
        c = mix(c, sunC*5., disk);
        gl_FragColor=vec4(c,1.); }`,
  }));
  m.frustumCulled = false; m.renderOrder = -100;
  m.onBeforeRender = (r, s, cam) => { u.invProj.value.copy(cam.projectionMatrixInverse); u.camW.value.copy(cam.matrixWorld); };
  m.u = u; return m;
}
// value noise 1D
const vn = (x, seed) => { const i = Math.floor(x), f = x - i, a = rnd(i * 1.37 + seed), b = rnd((i + 1) * 1.37 + seed); const s = f * f * (3 - 2 * f); return a + (b - a) * s; };
function ridgeTex(seed, o = {}) {
  const c = document.createElement('canvas'); c.width = 2048; c.height = 512; const g = c.getContext('2d');
  g.fillStyle = '#fff'; if (o.blur) g.filter = `blur(${o.blur}px)`; g.beginPath(); g.moveTo(0, 512);
  for (let x = 0; x <= 2048; x += 4) {
    const u = x / 2048; let y = 0;
    let amp = 1, fr = o.freq || 3, tot = 0;
    for (let k = 0; k < 5; k++) { y += vn(u * fr, seed + k * 11) * amp; tot += amp; amp *= o.rough ?? 0.5; fr *= 2.1; }
    y /= tot; if (o.dune) y = Math.pow(y, 1.6) + Math.sin(u * Math.PI * (o.dune)) * 0.12;
    g.lineTo(x, 512 - (o.base ?? 0.15) * 512 - y * (o.amp ?? 0.6) * 512);
  }
  g.lineTo(2048, 512); g.closePath(); g.fill();
  const t = new THREE.CanvasTexture(c); return t;
}
function cityTex(seed, o = {}) {
  const c = document.createElement('canvas'); c.width = 2048; c.height = 1024; const g = c.getContext('2d');
  let x = 0, i = 0;
  while (x < 2048) {
    const bw = 50 + rnd(seed + i) * 150, bh = (o.min ?? 0.25) * 1024 + rnd(seed + i * 3.1) * (o.var ?? 0.6) * 1024;
    g.fillStyle = o.fill || '#07080c'; g.fillRect(x, 1024 - bh, bw, bh);
    if (rnd(seed + i * 7) > 0.6) g.fillRect(x + bw * 0.45, 1024 - bh - 40 - rnd(i) * 60, 4, 60 + rnd(i) * 60);   // antenna
    for (let wy = 1024 - bh + 10; wy < 1014; wy += 12) for (let wx = x + 6; wx < x + bw - 8; wx += 9) {
      const r = rnd(seed + wx * 0.37 + wy * 1.91);
      if (r > (o.lit ?? 0.82)) { g.fillStyle = r > 0.97 ? '#9fd8ff' : (r > 0.93 ? '#ffd9a0' : '#ffb766'); g.globalAlpha = 0.35 + (r - .8) * 3; g.fillRect(wx, wy, 4, 6); g.globalAlpha = 1; }
    }
    x += bw + rnd(seed + i * 5) * 8; i++;
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function layer(scene, tex, z, w, h, y, color, o = {}) {
  const mat = new THREE.MeshBasicMaterial({ color, fog: true, transparent: !!o.soft, alphaTest: o.soft ? 0.01 : 0.5, depthWrite: !o.soft, ...(o.map ? { map: tex } : { alphaMap: tex }) });
  if (o.map) mat.color.set('#ffffff');
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  m.position.set(o.x || 0, y + h / 2, z); scene.add(m); return m;
}
function streaks(n, spread, o) {
  const pos = new Float32Array(n * 6); const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const m = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: o.color, transparent: true, opacity: o.opacity, fog: true, depthWrite: false }));
  m.frustumCulled = false;
  const seeds = Array.from({ length: n }, (_, i) => [rnd(i * 3.3 + 1) * spread[0] - spread[0] / 2, rnd(i * 7.1 + 2), -rnd(i * 1.7 + 5) * spread[2] + (o.z0 || 2), 0.8 + rnd(i * 2.9) * 0.4]);
  m.step = (t, speed) => {
    for (let i = 0; i < n; i++) {
      const [x, y0, z, sp] = seeds[i]; const H = spread[1];
      const y = H - ((y0 * H + t * speed * sp * o.v) % H + H) % H;
      const L = o.len * Math.min(1, speed);
      pos.set([x + o.wind * y * 0.02, y, z, x + o.wind * (y + L) * 0.02 + o.wind * 0.02 * L, y + L, z], i * 6);
    }
    g.attributes.position.needsUpdate = true;
  };
  return m;
}
function dust(n, box, o) {
  const pos = new Float32Array(n * 3), g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const m = new THREE.Points(g, new THREE.PointsMaterial({ color: o.color, size: o.size, sizeAttenuation: true, transparent: true, opacity: o.opacity, depthWrite: false, fog: true }));
  const s = Array.from({ length: n }, (_, i) => [rnd(i + 0.3), rnd(i + 9.1), rnd(i + 4.7)]);
  m.step = (t, speed = 1) => {
    for (let i = 0; i < n; i++) { const [a, b, c] = s[i];
      pos[i * 3] = ((a * box[0] + t * speed * o.wind * (0.6 + c)) % box[0]) - box[0] / 2; pos[i * 3 + 1] = b * box[1] + Math.sin(t * 1.3 + i) * 0.05; pos[i * 3 + 2] = -c * box[2] + 2; }
    g.attributes.position.needsUpdate = true;
  };
  return m;
}

function groundTex(kind) {
  const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d');
  const base = { sand: '#7a7a7a', wet: '#6a6a6a', asphalt: '#707070' }[kind]; g.fillStyle = base; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 9000; i++) { const v = 90 + rnd(i * 1.3) * 90; g.fillStyle = `rgb(${v},${v},${v})`; g.globalAlpha = 0.25; g.fillRect(rnd(i * 2.1) * 512, rnd(i * 3.7) * 512, 1 + rnd(i) * 2, 1 + rnd(i * 5) * 2); }
  g.globalAlpha = 1;
  if (kind === 'sand') { g.strokeStyle = 'rgba(160,160,160,.35)'; g.lineWidth = 3; for (let y = 0; y < 512; y += 18) { g.beginPath(); for (let x = 0; x <= 512; x += 8) g.lineTo(x, y + Math.sin(x * 0.0245 + y * 0.3) * 6); g.stroke(); } }
  if (kind === 'asphalt') { for (let i = 0; i < 40; i++) { g.fillStyle = 'rgba(200,200,200,.18)'; g.beginPath(); g.ellipse(rnd(i + 7) * 512, rnd(i + 9) * 512, 20 + rnd(i) * 50, 8 + rnd(i + 1) * 14, 0, 0, 7); g.fill(); } }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(60, 60); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
function ground(scene, kind, color) {
  const G = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshBasicMaterial({ color, map: groundTex(kind), fog: true }));
  G.rotation.x = -Math.PI / 2; scene.add(G); return G;
}
let shadowT = null;
function shadow(scene, fig, len = 3.2, op = 0.6, ang = 0) {
  if (!shadowT) { const c = document.createElement('canvas'); c.width = 128; c.height = 512; const g = c.getContext('2d');
    const gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr;
    g.beginPath(); g.moveTo(44, 0); g.lineTo(84, 0); g.lineTo(110, 512); g.lineTo(18, 512); g.fill(); shadowT = new THREE.CanvasTexture(c); }
  const m = new THREE.Mesh(new THREE.PlaneGeometry(0.75, len), new THREE.MeshBasicMaterial({ map: shadowT, transparent: true, opacity: op, depthWrite: false, fog: true }));
  m.geometry.translate(0, -len / 2, 0); m.rotation.x = -Math.PI / 2; m.rotation.z = ang; m.position.set(fig.position.x, 0.012, fig.position.z + 0.05);
  scene.add(m); return m;
}
export function desert() {
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2('#d98252', 0.02);
  const sk = sky({ zen: '#161a3a', mid: '#9a4c63', hor: '#f29a5a', glow: '#ff9a55', sunC: '#fff0d0', sun: [0.09, 0.075, -1], sunSize: 0.016, below: '#b8653f', glowK: 0.8 }); scene.add(sk);
  ground(scene, 'sand', '#6a3a26');
  const L = [[-70, 260, 22, -1.0, 0.5, 2, 0.35], [-46, 170, 14, -0.6, 0.55, 3, 0.4], [-30, 110, 9, -0.4, 0.5, 2.5, 0.45], [-18, 70, 5, -0.25, 0.45, 2, 0.5], [-9, 40, 2.2, -0.12, 0.4, 1.6, 0.6]];
  L.forEach(([z, w, h, y, rough, freq, amp], i) => layer(scene, ridgeTex(i * 31 + 3, { rough, freq, amp, dune: 1 + i % 2, base: 0.1, blur: [5, 3, 1.5, 0, 0][i] }), z, w, h, y, i < 2 ? '#3a1d14' : '#2c160d', { soft: i < 3 }));
  const fig = figure(0); fig.position.set(-0.35, -0.02, -6.5); scene.add(fig); shadow(scene, fig, 4.2, 0.55, -0.09);
  const d = dust(500, [24, 3, 14], { color: '#ffd2a8', size: 0.025, opacity: 0.55, wind: 0.5 }); scene.add(d);
  return { scene, fig, sky: sk, update(t, o = {}) { fig.draw(t * (o.speed ?? 1), o.variant ?? 0); d.step(t, o.speed ?? 1); } };
}
export function city() {
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2('#1b1830', 0.045);
  const sk = sky({ zen: '#04060d', hor: '#2a2140', glow: '#ff4f8b', sunC: '#000000', sun: [-0.5, 0.02, -1], sunSize: 0.0001, glowK: 0.25, below: '#141225' }); scene.add(sk);
  ground(scene, 'asphalt', '#1c1c26');
  [[-70, 230, 60, 0.3, 0.7, 0.9], [-48, 150, 40, 0.25, 0.6, 0.9], [-30, 95, 24, 0.2, 0.55, 0.9]].forEach(([z, w, h, mn, vr, lit], i) =>
    layer(scene, cityTex(i * 97 + 1, { min: mn, var: vr, lit }), z, w, h, -0.02, '#fff', { map: true }));
  // street lamp above the figure
  const pole = new THREE.Mesh(new THREE.BoxGeometry(0.07, 4.2, 0.07), new THREE.MeshBasicMaterial({ color: '#050507', fog: true })); pole.position.set(1.25, 2.1, -6.8); scene.add(pole);
  const arm = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.06, 0.06), new THREE.MeshBasicMaterial({ color: '#050507', fog: true })); arm.position.set(0.85, 4.15, -6.8); scene.add(arm);
  const lampC = document.createElement('canvas'); lampC.width = lampC.height = 256; const lg = lampC.getContext('2d');
  const gr = lg.createRadialGradient(128, 128, 0, 128, 128, 128); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.12, 'rgba(255,220,170,.6)'); gr.addColorStop(.5, 'rgba(255,170,90,.12)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); lg.fillStyle = gr; lg.fillRect(0, 0, 256, 256);
  const lampT = new THREE.CanvasTexture(lampC);
  const lamp = new THREE.Sprite(new THREE.SpriteMaterial({ map: lampT, color: new THREE.Color('#ffcf9a').multiplyScalar(2.2), blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })); lamp.scale.setScalar(1.5); lamp.position.set(0.5, 4.05, -6.8); scene.add(lamp);
  // lamp cone + puddle reflection
  const coneC = document.createElement('canvas'); coneC.width = 256; coneC.height = 512; const cg = coneC.getContext('2d');
  const cgr = cg.createLinearGradient(0, 0, 0, 512); cgr.addColorStop(0, 'rgba(255,200,140,.55)'); cgr.addColorStop(1, 'rgba(255,200,140,0)'); cg.fillStyle = cgr; cg.beginPath(); cg.moveTo(118, 0); cg.lineTo(138, 0); cg.lineTo(256, 512); cg.lineTo(0, 512); cg.fill();
  const cone = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 4.1), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(coneC), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.28 })); cone.position.set(0.5, 2.0, -6.82); scene.add(cone);
  const pud = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 6), new THREE.MeshBasicMaterial({ map: lampT, color: new THREE.Color('#ff9f5a'), transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false })); pud.rotation.x = -Math.PI / 2; pud.position.set(0.5, 0.013, -5.4); scene.add(pud);
  const neon = new THREE.Mesh(new THREE.PlaneGeometry(4, 8), new THREE.MeshBasicMaterial({ map: lampT, color: new THREE.Color('#ff3d7f'), transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false })); neon.rotation.x = -Math.PI / 2; neon.position.set(-3.5, 0.01, -9); scene.add(neon);
  const fig = figure(0); fig.position.set(0.35, -0.02, -6.6); scene.add(fig); shadow(scene, fig, 2.2, 0.5, 0.25);
  const rain = streaks(2600, [16, 7, 16], { color: '#b9c4e0', opacity: 0.4, len: 0.35, v: 9, wind: -2 }); scene.add(rain);
  return { scene, fig, sky: sk, update(t, o = {}) { fig.draw(t * (o.speed ?? 1), o.variant ?? 0); rain.step(t, o.speed ?? 1); } };
}
export function shore() {
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2('#cfa89c', 0.012);
  const sunDir = new THREE.Vector3(0.1, 0.07, -1).normalize();
  const sk = sky({ zen: '#5a6f8e', mid: '#b79aa6', hor: '#eab79c', glow: '#ffc9a0', sunC: '#fff1dc', sun: sunDir.toArray(), sunSize: 0.011, below: '#c99f93', glowK: 0.45 }); scene.add(sk);
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(400, 400, 1, 1), new THREE.ShaderMaterial({
    uniforms: { t: { value: 0 }, sunDir: { value: sunDir }, near: { value: new THREE.Color('#2f3a4a') }, far: { value: new THREE.Color('#c9a39a') }, sunC: { value: new THREE.Color('#fff2dc') } },
    vertexShader: `varying vec3 vW; void main(){ vec4 w=modelMatrix*vec4(position,1.); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`,
    fragmentShader: `uniform float t; uniform vec3 sunDir, near, far, sunC; varying vec3 vW;
      void main(){ vec3 v=normalize(vW-cameraPosition); float dist=length(vW-cameraPosition);
        vec2 p=vW.xz; vec3 n=normalize(vec3( sin(p.x*3.1+t*1.7)*.08+sin(p.x*7.3-p.y*5.1+t*2.9)*.05+sin(p.x*17.+p.y*11.+t*4.)*.03, 1., sin(p.y*2.3+t*1.3)*.1+sin(p.y*9.1+p.x*3.+t*3.3)*.05+sin(p.y*23.-t*5.)*.03));
        vec3 r=reflect(v,n); float s=pow(max(dot(r,sunDir),0.),600.)*4.+pow(max(dot(r,sunDir),0.),60.)*.12;
        vec3 c=mix(near, far, smoothstep(2.,70.,dist)); c+=sunC*s*smoothstep(1.,6.,dist);
        gl_FragColor=vec4(c,1.); }`,
  }));
  sea.rotation.x = -Math.PI / 2; sea.position.y = -0.05; scene.add(sea);
  // wet sand foreground with a foam edge
  const sandC = document.createElement('canvas'); sandC.width = 1024; sandC.height = 256; const sg = sandC.getContext('2d');
  sg.fillStyle = '#fff'; sg.beginPath(); sg.moveTo(0, 256); for (let x = 0; x <= 1024; x += 8) sg.lineTo(x, 120 + Math.sin(x * 0.012) * 24 + Math.sin(x * 0.041) * 9); sg.lineTo(1024, 256); sg.fill();
  const sand = new THREE.Mesh(new THREE.PlaneGeometry(60, 9), new THREE.MeshBasicMaterial({ color: '#3a3433', alphaMap: new THREE.CanvasTexture(sandC), transparent: true, fog: true, depthWrite: false }));
  sand.rotation.x = -Math.PI / 2; sand.position.set(0, -0.03, -1.5); scene.add(sand);
  const foamC = document.createElement('canvas'); foamC.width = 1024; foamC.height = 64; const fg = foamC.getContext('2d');
  fg.strokeStyle = '#fff'; fg.lineWidth = 6; fg.beginPath(); for (let x = 0; x <= 1024; x += 8) fg.lineTo(x, 32 + Math.sin(x * 0.02) * 10 + Math.sin(x * 0.07) * 4); fg.stroke();
  const foam = new THREE.Mesh(new THREE.PlaneGeometry(60, 0.6), new THREE.MeshBasicMaterial({ color: '#fff7ee', alphaMap: new THREE.CanvasTexture(foamC), transparent: true, opacity: 0.6, fog: true, depthWrite: false }));
  foam.rotation.x = -Math.PI / 2; scene.add(foam);
  [[-80, 120, 7, -40, 0.5, 3, 0.5], [-55, 70, 4, 34, 0.55, 2.5, 0.55]].forEach(([z, w, h, x, rough, freq, amp], i) => layer(scene, ridgeTex(i * 53 + 9, { rough, freq, amp, base: 0.05, blur: 3 }), z, w, h, -0.1, '#5e5560', { x, soft: true }));
  const fig = figure(0); fig.position.set(-0.3, -0.04, -6.0); scene.add(fig); shadow(scene, fig, 3.0, 0.35, -0.08);
  const refl = figure(0); refl.scale.y = -1; refl.position.copy(fig.position); refl.position.y -= 0.06; refl.material.opacity = 0.28; refl.material.alphaTest = 0.0; scene.add(refl);
  return { scene, fig, sky: sk, update(t, o = {}) {
    const s = t * (o.speed ?? 1); fig.draw(s, o.variant ?? 0); refl.draw(s, o.variant ?? 0); sea.material.uniforms.t.value = s;
    const w = Math.sin(s * 0.9); foam.position.set(0, -0.02, -2.9 + w * 0.35); foam.material.opacity = 0.35 + 0.3 * (0.5 + 0.5 * w); } };
}
