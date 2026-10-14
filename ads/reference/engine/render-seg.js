// node engine/render-seg.js dist/ad.html out.mp4 fps f0 f1  -> frames [f0,f1) with K-subframe motion blur (180° shutter, K=env SUB or 10)
const {chromium}=require('playwright');const {spawn}=require('child_process');const path=require('path');
(async()=>{
 const [html,out,fpsA,f0A,f1A]=process.argv.slice(2); const FPS=+fpsA, K=+(process.env.SUB||10), sub=1/(FPS*2*K);
 const b=await chromium.launch();const p=await b.newPage({viewport:{width:+(process.env.VW||1920),height:+(process.env.VH||1080)}});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file://'+path.resolve(html)+'?render');await p.evaluate(()=>window.READY);
 const T=await p.evaluate(()=>window.DURATION); const N=Math.round(T*FPS);
 const f0=+f0A||0, f1=Math.min(N,f1A?+f1A:N);
 const vf=`format=gbrp,tmix=frames=${K}:weights='${Array(K).fill(1).join(' ')}',select='eq(mod(n\\,${K})\\,${K-1})',setpts=N/(${FPS})/TB`;
 const ff=spawn('ffmpeg',['-loglevel','error','-y','-f','image2pipe','-framerate',String(FPS*K),'-c:v','png','-i','-','-vf',vf,'-r',String(FPS),
   '-c:v','libx264','-crf','12','-preset','medium','-pix_fmt','yuv420p','-color_primaries','bt709','-color_trc','bt709','-colorspace','bt709',out]);
 ff.stderr.on('data',d=>process.stderr.write(d));
 for(let f=f0;f<f1;f++){for(let k=0;k<K;k++){const t=Math.max(0,f/FPS+(k-(K-1)/2)*sub);await p.evaluate(t=>seek(t),t);
   const buf=await p.screenshot({type:'png'}); if(!ff.stdin.write(buf)) await new Promise(r=>ff.stdin.once('drain',r));}}
 ff.stdin.end();await new Promise(r=>ff.on('close',r));await b.close();
 console.log('rendered',out,f0,f1,errs.length?'ERR '+errs[0]:'');
})();
