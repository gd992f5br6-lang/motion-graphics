// The character: a backlit silhouette drawn on canvas, re-drawn every frame so coat and scarf move with the wind.
// Variant 0 is the locked "Soul ID" hero (hat, long coat, red scarf). 1 and 2 are the drifting versions.
import * as THREE from 'three';

const V = [
  { hat: true, hem: 0.75, width: 1.0, scarf: '#8a1d15', rim: 'rgba(255,170,120,.75)', body: '#09090b', hood: false, bun: false },
  { hat: false, hem: 0.52, width: 0.92, scarf: '#1d3f8a', rim: 'rgba(255,170,120,.75)', body: '#121216', hood: false, bun: true },
  { hat: false, hem: 0.70, width: 1.08, scarf: null, rim: 'rgba(255,170,120,.75)', body: '#24242a', hood: true, bun: false },
];

function body(g, w, h, v, t, dx = 0) {
  const X = x => (0.5 + (x - 0.5) * v.width) * w + dx, Y = y => y * h;
  const sway = Math.sin(t * 2.1) * 0.012 + Math.sin(t * 5.3) * 0.004;
  g.beginPath();
  // coat
  g.moveTo(X(0.455), Y(0.15));
  g.quadraticCurveTo(X(0.36), Y(0.155), X(0.335), Y(0.2));
  g.bezierCurveTo(X(0.315), Y(0.28), X(0.31), Y(0.4), X(0.325), Y(0.47));
  g.lineTo(X(0.33), Y(0.5));
  const hm = v.hem;
  g.bezierCurveTo(X(0.31), Y(0.5 + (hm - 0.5) * .4), X(0.295 + sway), Y(hm - 0.05), X(0.285 + sway * 1.3), Y(hm));
  g.quadraticCurveTo(X(0.5 + sway), Y(hm + 0.02), X(0.715 + sway * 1.5), Y(hm - 0.004));
  g.bezierCurveTo(X(0.7), Y(hm - 0.07), X(0.685), Y(0.5 + (hm - 0.5) * .4), X(0.67), Y(0.5));
  g.lineTo(X(0.675), Y(0.47));
  g.bezierCurveTo(X(0.69), Y(0.4), X(0.685), Y(0.28), X(0.665), Y(0.2));
  g.quadraticCurveTo(X(0.64), Y(0.155), X(0.545), Y(0.15));
  g.closePath(); g.fill();
  // legs + boots
  for (const [a, b] of [[0.418, 0.482], [0.518, 0.582]]) {
    g.beginPath(); g.moveTo(X(a), Y(hm - 0.02)); g.lineTo(X(b), Y(hm - 0.02)); g.lineTo(X(b - 0.006), Y(0.935)); g.lineTo(X(b + 0.006), Y(0.975));
    g.lineTo(X(a - 0.012), Y(0.975)); g.lineTo(X(a + 0.004), Y(0.935)); g.closePath(); g.fill();
  }
  // neck + head
  g.fillRect(X(0.47), Y(0.125), X(0.53) - X(0.47), Y(0.04));
  g.beginPath(); g.ellipse(X(0.5), Y(0.112), 0.052 * w * v.width, 0.058 * h, 0, 0, 7); g.fill();
  if (v.hat) {
    g.beginPath(); g.ellipse(X(0.5), Y(0.083), 0.158 * w, 0.021 * h, 0, 0, 7); g.fill();
    g.beginPath(); g.moveTo(X(0.43), Y(0.084)); g.lineTo(X(0.44), Y(0.038)); g.quadraticCurveTo(X(0.5), Y(0.018), X(0.56), Y(0.038)); g.lineTo(X(0.57), Y(0.084)); g.closePath(); g.fill();
  }
  if (v.bun) { g.beginPath(); g.arc(X(0.5), Y(0.05), 0.032 * w, 0, 7); g.fill(); }
  if (v.hood) { g.beginPath(); g.moveTo(X(0.41), Y(0.17)); g.quadraticCurveTo(X(0.4), Y(0.04), X(0.5), Y(0.04)); g.quadraticCurveTo(X(0.6), Y(0.04), X(0.59), Y(0.17)); g.closePath(); g.fill(); }
}
function scarf(g, w, h, v, t) {
  if (!v.scarf) return;
  const X = x => (0.5 + (x - 0.5) * v.width) * w, Y = y => y * h;
  g.fillStyle = v.scarf;
  g.beginPath(); g.ellipse(X(0.5), Y(0.158), 0.075 * w, 0.017 * h, 0, 0, 7); g.fill();
  const top = [], bot = [];
  for (let i = 0; i <= 24; i++) {
    const u = i / 24, x = 0.555 + u * 0.36;
    const y = 0.152 + u * 0.05 + Math.sin(u * 7 - t * 9.5) * 0.014 * u + Math.sin(u * 13 - t * 15) * 0.005 * u;
    const th = (0.03 - u * 0.016);
    top.push([X(x), Y(y - th / 2)]); bot.push([X(x), Y(y + th / 2)]);
  }
  g.beginPath(); g.moveTo(...top[0]); top.forEach(p => g.lineTo(...p)); bot.reverse().forEach(p => g.lineTo(...p)); g.closePath(); g.fill();
}

export function figure(variant = 0, height = 1.8) {
  const c = document.createElement('canvas'); c.width = 768; c.height = 1536;
  const g = c.getContext('2d');
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.04, fog: true });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(height / 2, height), mat);
  m.geometry.translate(0, height / 2 - height * 0.025, 0);
  let lastV = -1, lastT = -1;
  m.draw = (t, v = variant) => {
    if (v === lastV && Math.abs(t - lastT) < 1e-4) return;
    lastV = v; lastT = t;
    const P = V[v];
    g.clearRect(0, 0, 768, 1536);
    g.fillStyle = P.rim; body(g, 768, 1536, P, t, 5);          // rim light on the sun side
    g.fillStyle = P.body; body(g, 768, 1536, P, t, 0);
    scarf(g, 768, 1536, P, t);
    tex.needsUpdate = true;
  };
  // always face the lens around the vertical axis (a cut-out seen edge-on would give itself away)
  m.onBeforeRender = (r, sc, cam) => { m.rotation.y = Math.atan2(cam.position.x - m.position.x, cam.position.z - m.position.z); m.updateMatrixWorld(); };
  m.draw(0);
  return m;
}
