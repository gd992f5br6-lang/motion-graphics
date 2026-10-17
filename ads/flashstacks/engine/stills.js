// node engine/stills.js dist/ad.html out.png t1 t2 ... -> contact sheet (and single frames in work/frames)
const {chromium}=require('playwright');const path=require('path');const {execSync}=require('child_process');const fs=require('fs');
(async()=>{const [html,out,...ts]=process.argv.slice(2);
 const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 await p.goto('file://'+path.resolve(html)+'?render');await p.evaluate(()=>window.READY);
 console.log(JSON.stringify(await p.evaluate(()=>window.SIZES)));
 const dir='work/frames';fs.mkdirSync(dir,{recursive:true});execSync(`rm -f ${dir}/*.png`);
 for(let i=0;i<ts.length;i++){await p.evaluate(t=>seek(t),+ts[i]);await p.screenshot({path:`${dir}/${String(i).padStart(3,'0')}.png`});}
 await b.close();
 const cols=Math.min(5,ts.length),rows=Math.ceil(ts.length/cols);
 execSync(`ffmpeg -loglevel error -y -i ${dir}/%03d.png -vf "scale=360:-1,tile=${cols}x${rows}:padding=6:color=white" -frames:v 1 ${out}`);
 if(errs.length) console.log('ERR',errs);})();
