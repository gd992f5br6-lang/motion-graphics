// Render frames [from, to) of the reel to out/frames/%05d.jpg (resumable, can run as several workers).
// node tools/render.js <from> <to> [fps=30] [subframes=1]
//   subframes > 1 renders that many samples across a 180° shutter and averages them (motion blur).
const { chromium } = require('playwright'); const serve = require('./serve'); const fs = require('fs'); const path = require('path');
(async () => {
  const [from, to, fpsA, subA] = process.argv.slice(2).map(Number);
  const FPS = fpsA || 30, K = subA || 1;
  const s = await serve(); const port = s.address().port;
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', e => { console.error('PAGEERR', e.message); process.exit(1); });
  await p.goto(`http://127.0.0.1:${port}/index.html?render${process.env.Q || ""}`); await p.waitForFunction(() => window.READY, null, { timeout: 300000 });
  const dur = await p.evaluate(() => window.DURATION);
  const last = Math.min(to || Infinity, Math.round(dur * FPS));
  const dir = path.join(__dirname, '../out/frames'); fs.mkdirSync(dir, { recursive: true });
  const t0 = Date.now(); let done = 0;
  for (let f = from; f < last; f++) {
    const file = path.join(dir, String(f).padStart(5, '0') + '.jpg');
    if (fs.existsSync(file)) continue;
    if (K === 1) {
      await p.evaluate(t => seek(t), f / FPS);
      await p.screenshot({ path: file + '.tmp', type: 'jpeg', quality: 96 });
    } else {
      const shots = [];
      for (let k = 0; k < K; k++) { const t = f / FPS + ((k + 0.5) / K - 0.5) * (0.5 / FPS); await p.evaluate(t => seek(t), Math.max(0, t)); shots.push(await p.screenshot({ type: 'png' })); }
      fs.writeFileSync(file + '.parts', ''); // marker
      shots.forEach((buf, k) => fs.writeFileSync(`${file}.${k}.png`, buf));
    }
    if (K === 1) fs.renameSync(file + '.tmp', file);
    done++;
    if (done % 25 === 0) { const r = (Date.now() - t0) / done; console.log(`frame ${f} · ${(r / 1000).toFixed(2)} s/frame · eta ${((last - f) * r / 60000).toFixed(1)} min`); }
  }
  await b.close(); s.close(); console.log('done', from, last);
})();
