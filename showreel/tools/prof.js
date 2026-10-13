const { chromium } = require('playwright'); const serve = require('./serve');
(async () => {
  const s = await serve(); const port = s.address().port;
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto(`http://127.0.0.1:${port}/index.html?render`+(process.argv[2]||'')); await p.waitForFunction(() => window.READY, null, { timeout: 300000 });
  for (const T of [2, 22, 46]) {
    let a = 0, c = 0;
    for (let i = 0; i < 4; i++) {
      let t0 = Date.now(); await p.evaluate(t => { seek(t); document.getElementById('gl').getContext('webgl2').finish(); }, T + i / 30); a += Date.now() - t0;
      t0 = Date.now(); await p.screenshot({ type: 'jpeg', quality: 96 }); c += Date.now() - t0;
    }
    console.log(T, 'seek+gl', a / 4, 'shot', c / 4);
  }
  await b.close(); s.close();
})();
