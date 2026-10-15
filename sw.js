/* Offline-first source images/PDF; network-first app updates. */
const CACHE_NAME='ems-cog-3-3-east-v2';
const ASSETS=['./','index.html','styles.css','app.js','protocols.json','manifest.webmanifest','icon-192.png','icon-512.png','new_protocols.pdf',
  ...Array.from({length:9},(_,i)=>`reference-pages/cog-page-${i+580}.webp`)];
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const cache=await caches.open(CACHE_NAME);
 await Promise.allSettled(ASSETS.map(path=>cache.add(path)));
 await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 await Promise.all((await caches.keys()).filter(name=>name!==CACHE_NAME).map(name=>caches.delete(name)));
 await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const url=new URL(event.request.url);
 if(url.origin!==self.location.origin)return;
 const preferCache=url.pathname.endsWith('/new_protocols.pdf')||url.pathname.includes('/reference-pages/');
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE_NAME);
  if(preferCache){const cached=await cache.match(event.request);if(cached)return cached;}
  try{const response=await fetch(event.request);
    if(response.ok)cache.put(event.request,response.clone()).catch(()=>{});
    return response;
  }catch(error){const cached=await cache.match(event.request);if(cached)return cached;throw error;}
 })());
});
