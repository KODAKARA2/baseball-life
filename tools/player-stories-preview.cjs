// node tools/player-stories-preview.cjs [port] — 로컬 테스트 저장은 운영 사이트와 분리됩니다.
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),port=Number(process.argv[2]||8772);
const server=http.createServer((req,res)=>{
 let name;try{name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400).end();return;}
 const file=path.resolve(root,'.'+(name==='/'?'/index.html':name));
 if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 fs.readFile(file,(err,body)=>{
  if(err){res.writeHead(404).end();return;}
  if(file===path.join(root,'index.html'))body=Buffer.from(body.toString().replace('</body>','<script src="/tools/player-stories-demo.js"></script></body>'));
  res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2'})[path.extname(file)]||'application/octet-stream');
  res.setHeader('Cache-Control','no-store');res.end(body);
 });
});
server.listen(port,'127.0.0.1',()=>console.log('Player stories preview: http://127.0.0.1:'+port+'/'));
