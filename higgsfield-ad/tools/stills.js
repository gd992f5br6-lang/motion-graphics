// node tools/stills.js 1.2 4.5 ...   -> out/stills/t_1.20.jpg  (renders single frames for review)
const { chromium } = require('playwright'); const serve = require('./serve'); const fs = require('fs');
(async () => {
  const s = await serve(); const port = s.address().port;
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', e => { console.log('PAGEERR', e.message); process.exit(1); }); p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') console.log('console', m.text().slice(0, 300)); });
  await p.goto(`http://127.0.0.1:${port}/index.html?render`); await p.waitForFunction(() => window.READY, null, { timeout: 120000 });
  fs.mkdirSync('out/stills', { recursive: true });
  for (const a of process.argv.slice(2)) {
    const t = +a; await p.evaluate(t => seek(t), t);
    await p.screenshot({ path: `out/stills/t_${t.toFixed(2)}.jpg`, type: 'jpeg', quality: 90 });
    console.log('still', t);
  }
  await b.close(); s.close();
})();
