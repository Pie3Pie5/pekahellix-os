const CACHE = 'pekahellix-v0.5-f.4';
const APP_SHELL = [
  './', './index.html', './style.css?v=0.5-f.4', './script.js?v=0.5-f.4', './config.js', './logo.png', './logo-header.png',
  './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // IMPORTANT : le Service Worker ne doit jamais intercepter ni mettre en cache
  // les requêtes API externes (Supabase, CDN, etc.). Sinon une ancienne réponse
  // de profil peut être resservie alors que le compte a été désactivé.
  if (url.origin !== self.location.origin) return;

  // Pour les pages HTML, privilégier le réseau afin que les mises à jour
  // GitHub Pages apparaissent rapidement, avec repli hors ligne sur le cache.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put('./index.html', copy));
          return response;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  const isCodeAsset = url.pathname.endsWith('/script.js') || url.pathname.endsWith('/style.css') || url.pathname.endsWith('/config.js');

  // Les fichiers de code doivent être rafraîchis depuis le réseau en priorité.
  // Cela évite qu'une ancienne version de script.js reste bloquée par le cache PWA.
  if (isCodeAsset) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE).then(cache => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      if (response && response.status === 200 && (response.type === 'basic' || response.type === 'cors')) {
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put(event.request, copy));
      }
      return response;
    }))
  );
});
