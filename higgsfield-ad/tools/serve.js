// Minimal static file server for the showreel (ES modules need http, not file://)
const http=require('http'),fs=require('fs'),path=require('path');
const ROOT=path.resolve(__dirname,'..');
const MIME={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.woff2':'font/woff2','.woff':'font/woff','.png':'image/png','.jpg':'image/jpeg','.json':'application/json','.wav':'audio/wav'};
module.exports=(port=0)=>new Promise(res=>{
  const s=http.createServer((q,r)=>{
    const p=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));
    if(!p.startsWith(ROOT)||!fs.existsSync(p)||fs.statSync(p).isDirectory()){r.writeHead(404);return r.end();}
    r.writeHead(200,{'Content-Type':MIME[path.extname(p)]||'application/octet-stream'});fs.createReadStream(p).pipe(r);
  });
  s.listen(port,'127.0.0.1',()=>res(s));
});
if(require.main===module) module.exports(+process.argv[2]||8080).then(s=>console.log('http://127.0.0.1:'+s.address().port));
