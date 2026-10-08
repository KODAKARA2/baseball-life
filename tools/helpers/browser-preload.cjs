// Run existing Edge/file-URL checks on installed Chromium over localhost.
const {chromium}=require('playwright'),path=require('node:path'),{fileURLToPath}=require('node:url'),H=require('./browser');
const root=path.resolve(__dirname,'../..'),launch=chromium.launch.bind(chromium),seen=new WeakSet();
function wrap(page){if(seen.has(page))return page;seen.add(page);const go=page.goto.bind(page);page.goto=async(url,...args)=>{if(String(url).startsWith('file:')){const u=new URL(url),f=fileURLToPath(u);if(f.startsWith(root+path.sep))url=(await H.url())+path.relative(root,f).split(path.sep).join('/')+u.search+u.hash;}return go(url,...args);};return page;}
chromium.launch=async options=>{const b=await launch({...options,...H.launchOptions(),channel:undefined}),np=b.newPage.bind(b),nc=b.newContext.bind(b);b.newPage=async(...a)=>wrap(await np(...a));b.newContext=async(...a)=>{const c=await nc(...a),n=c.newPage.bind(c);c.newPage=async(...a)=>wrap(await n(...a));return c;};return b;};
