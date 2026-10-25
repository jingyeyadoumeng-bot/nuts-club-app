const CACHE='nuts-club-shell-v3';const SHELL=['/member.html','/premium-lounge.css','/nuts-icon.svg','/manifest.webmanifest'];self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)));self.skipWaiting()});self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))));self.clients.claim()});self.addEventListener('fetch',event=>{const request=event.request;if(request.method!=='GET'||new URL(request.url).origin!==self.location.origin)return;const url=new URL(request.url);if(url.pathname.startsWith('/api/')||url.pathname.includes('auth'))return;event.respondWith(fetch(request).then(response=>{if(response.ok&&['document','style','script','image'].includes(request.destination)){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(request,copy)).catch(()=>{})}return response}).catch(()=>caches.match(request).then(cached=>cached||Response.error())))})
self.addEventListener('push',event=>{
 let payload={title:'NUTS CLUB',body:'新しいお知らせがあります',url:'/member.html#home'};
 try{if(event.data)payload={...payload,...event.data.json()}}catch{}
 const url=typeof payload.url==='string'&&payload.url.startsWith('/')&&!payload.url.startsWith('//')?payload.url:'/member.html#home';
 event.waitUntil(self.registration.showNotification(payload.title,{body:payload.body,icon:'/nuts-icon.svg',badge:'/nuts-icon.svg',tag:payload.tag||'nuts-notice',data:{url}}));
});
self.addEventListener('notificationclick',event=>{
 event.notification.close();
 const url=new URL(event.notification.data?.url||'/member.html#home',self.location.origin).href;
 event.waitUntil((async()=>{const clientsList=await self.clients.matchAll({type:'window',includeUncontrolled:true});for(const client of clientsList){if(new URL(client.url).origin===self.location.origin){await client.focus();await client.navigate(url);return}}await self.clients.openWindow(url)})());
});