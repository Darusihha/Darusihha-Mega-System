const CACHE_NAME = 'darusihha-cache-v1';
const urlsToCache = [
  '/Darusihha-Mega-System/',
  '/Darusihha-Mega-System/index.html',
  '/Darusihha-Mega-System/logo.png',
  '/Darusihha-Mega-System/profile.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
