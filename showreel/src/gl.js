// Shared three.js building blocks: studio environments, backdrops, canvas textures, projection.
import * as THREE from 'three';

// Studio environment: emissive softboxes around a black void, prefiltered for PBR reflections.
// panels: [{pos:[x,y,z], size:[w,h], color:'#fff', intensity:n}]
export function studioEnv(renderer, panels, base = 0x000000) {
  const env = new THREE.Scene();
  env.background = new THREE.Color(base);
  for (const p of panels) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(p.size[0], p.size[1]),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(p.color || '#fff').multiplyScalar(p.intensity ?? 1), side: THREE.DoubleSide }));
    m.position.set(...p.pos); m.lookAt(0, 0, 0); env.add(m);
  }
  const pm = new THREE.PMREMGenerator(renderer);
  const tex = pm.fromScene(env, 0.02).texture; pm.dispose();
  return tex;
}

// Full-screen gradient backdrop drawn behind everything (clip-space quad).
export function backdrop(o = {}) {
  const u = {
    c0: { value: new THREE.Color(o.c0 || '#050506') },
    c1: { value: new THREE.Color(o.c1 || '#20120f') },
    c2: { value: new THREE.Color(o.c2 || '#000000') },
    g1: { value: new THREE.Vector4(...(o.g1 || [0.5, 0.5, 0.6, 1])) },  // glow 1: x, y, radius, strength
    g2: { value: new THREE.Vector4(...(o.g2 || [0.5, 0.5, 0.0, 0])) },  // glow 2
    aspect: { value: 16 / 9 },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms: u, depthWrite: false, depthTest: false,
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.9999,1.); }`,
    fragmentShader: `uniform vec3 c0,c1,c2; uniform vec4 g1,g2; uniform float aspect; varying vec2 vUv;
      void main(){
        vec2 p=vUv; vec2 d1=(p-g1.xy)*vec2(aspect,1.); vec2 d2=(p-g2.xy)*vec2(aspect,1.);
        float a=exp(-dot(d1,d1)/(g1.z*g1.z))*g1.w; float b=exp(-dot(d2,d2)/(max(g2.z,1e-3)*max(g2.z,1e-3)))*g2.w;
        vec3 col=c0+c1*a+c2*b;
        gl_FragColor=vec4(col,1.);
      }`,
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
  m.frustumCulled = false; m.renderOrder = -100;
  m.u = u;
  return m;
}

export function canvasTex(w, h, draw, o = {}) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); draw(g, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = o.linear ? THREE.NoColorSpace : THREE.SRGBColorSpace;
  t.anisotropy = 8;
  if (o.repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...o.repeat); }
  t.canvas = c; t.g = g;
  return t;
}

export function roundRect(g, x, y, w, h, r) {
  g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}

// Rounded-rectangle extruded slab (cards, devices, chips), centred on the origin, depth along z.
export function roundedSlab(w, h, d, r, bevel = 0.01, seg = 8) {
  const s = new THREE.Shape(); const x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  const g = new THREE.ExtrudeGeometry(s, { depth: d - 2 * bevel, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: seg, curveSegments: 24 });
  g.translate(0, 0, -(d - 2 * bevel) / 2);
  // planar UVs for the faces (0..1 across the shape)
  const pos = g.attributes.position, uv = g.attributes.uv;
  for (let i = 0; i < pos.count; i++) uv.setXY(i, (pos.getX(i) - x) / w, (pos.getY(i) - y) / h);
  g.computeVertexNormals();
  return g;
}

// world -> stage pixels
const _v = new THREE.Vector3();
export function project(cam, p, W = 1920, H = 1080) {
  _v.set(p[0], p[1], p[2]).project(cam);
  return [(_v.x * .5 + .5) * W, (-_v.y * .5 + .5) * H, _v.z];
}

export function glowSprite(color = '#ffffff', size = 1, o = {}) {
  const tex = canvasTex(256, 256, (g, w, h) => {
    const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(o.core ?? 0.15, 'rgba(255,255,255,.55)');
    gr.addColorStop(.45, 'rgba(255,255,255,.12)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
  });
  const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color: new THREE.Color(color).multiplyScalar(o.intensity ?? 1), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, toneMapped: false }));
  m.scale.setScalar(size);
  return m;
}

export const lookCam = (cam, pos, tgt, roll = 0) => {
  cam.position.set(...pos); cam.up.set(Math.sin(roll), Math.cos(roll), 0); cam.lookAt(...tgt);
};
