const CACHE_NAME = 'darusihha-v2.0';
const ASSETS = ['./', './index.html', './manifest.json', './logo.png', './profile.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => 
    Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
  ).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const isNav = e.request.mode === 'navigate' || (e.request.headers.get('accept') || '').includes('text/html');
  e.respondWith(caches.match(e.request).then(cached => {
    if (cached) return cached;
    return fetch(e.request).then(res => {
      if (res && res.status === 200 && res.type === 'basic') { 
        const cl = res.clone(); 
        caches.open(CACHE_NAME).then(c => c.put(e.request, cl)); 
      }
      return res;
    }).catch(() => isNav ? caches.match('./index.html') : new Response('', { status: 504 }));
  }));
});
