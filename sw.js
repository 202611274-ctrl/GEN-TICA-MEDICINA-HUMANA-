'use strict';
const PREFIX='genetica-urp:'+self.registration.scope;
const CACHE=PREFIX+'v1.0.0';
const FILES=['./','./index.html','./assets/style.css','./assets/core.js','./assets/app.js','./assets/icon.svg','./assets/icon-192.png','./assets/icon-512.png','./data/bank.js','./manifest.webmanifest','./docs/GUIA_GITHUB.html'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith(PREFIX)&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 const u=new URL(event.request.url);if(event.request.method!=='GET'||u.origin!==self.location.origin||!u.href.startsWith(self.registration.scope))return;
 event.respondWith(fetch(event.request).then(response=>{
  if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(c=>c.put(event.request,copy)));}return response;
 }).catch(async()=>{const cache=await caches.open(CACHE);return await cache.match(event.request)||(event.request.mode==='navigate'?await cache.match('./index.html'):new Response('Recurso no disponible sin conexión',{status:503}));}));
});
