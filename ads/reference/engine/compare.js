// node engine/compare.js ad.html out.png t1 t2 ... -> rows of [reference | rebuild] at each time
const {chromium}=require('playwright');const path=require('path');const {execSync}=require('child_process');const fs=require('fs');
(async()=>{const [html,out,...ts]=process.argv.slice(2);
 const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080}});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 await p.goto('file://'+path.resolve(html)+'?render');await p.evaluate(()=>window.READY);
 const dir='work/cmp';fs.mkdirSync(dir,{recursive:true});execSync(`rm -f ${dir}/*.png`);
 for(let i=0;i<ts.length;i++){const n=String(i).padStart(3,'0');await p.evaluate(t=>seek(t),+ts[i]);await p.screenshot({path:`${dir}/m${n}.png`});
   execSync(`ffmpeg -loglevel error -y -i reference.mp4 -vf "select='gte(t\\,${ts[i]})',scale=1920:1080" -frames:v 1 ${dir}/r${n}.png`);
   execSync(`ffmpeg -loglevel error -y -i ${dir}/r${n}.png -i ${dir}/m${n}.png -filter_complex "[0]scale=800:450,drawtext=text='ref ${ts[i]}':x=10:y=10:fontsize=24:fontcolor=white:box=1:boxcolor=black@.6[a];[1]scale=800:450[b];[a][b]hstack" ${dir}/c${n}.png`);}
 await b.close();
 execSync(`ffmpeg -loglevel error -y -i ${dir}/c%03d.png -vf "tile=1x${ts.length}:padding=4:color=white" -frames:v 1 ${out}`);
 if(errs.length) console.log('ERR',errs);})();
