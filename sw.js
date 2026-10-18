/* Solar System Lab service worker: works offline after the first visit. */
const VERSION='lab-v1';
const CORE=['./','index.html','sky.html','events.html','iss.html','orrery.html','marswalk.html','you.html','quiz.html',
  'anomaly.html','mission.html','landing.html','discovery.html','lab.css','lab.js','app.js','narr.js','space.js','sky-engine.js','i18n.js',
  'favicon.svg','favicon-32.png','icon-192.png','icon-512.png','manifest.webmanifest'];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(VERSION).then(c=>Promise.all(CORE.map(u=>c.add(u).catch(()=>{})))).then(()=>self.skipWaiting())); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{
  const req=e.request, url=new URL(req.url);
  if(req.method!=='GET') return;
  if(req.headers.has('range')||/\.(mp4|mp3)$/.test(url.pathname)) return;          // media: straight to network
  const live=/wheretheiss\.at|celestrak\.org|trek\.nasa\.gov/.test(url.hostname);
  if(live) return;                                                                     // live data is never cached
  if(req.mode==='navigate'||url.origin===location.origin){
    // network first so updates show at once; fall back to the cached copy offline
    e.respondWith(fetch(req).then(r=>{ if(r.ok){ const cp=r.clone(); caches.open(VERSION).then(c=>c.put(req,cp)); } return r; })
      .catch(()=>caches.match(req,{ignoreSearch:true}).then(r=>r||caches.match('index.html'))));
    return;
  }
  // CDN libraries and fonts: cache first
  if(/cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net|fonts\.(googleapis|gstatic)\.com/.test(url.hostname)){
    e.respondWith(caches.match(req).then(r=>r||fetch(req).then(n=>{ if(n.ok||n.type==='opaque'){ const cp=n.clone(); caches.open(VERSION).then(c=>c.put(req,cp)); } return n; })));
  }
});
