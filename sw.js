const CACHE_NAME = 'mcu-tracker-v1.1.1';
const ASSETS = [
  './',
  './index.html',
  './style.css?v=1.1.1',
  './data.js?v=1.1.1',
  './store.js?v=1.1.1',
  './templates.js?v=1.1.1',
  './ui.js?v=1.1.1',
  './controller.js?v=1.1.1',
  './manifest.json',
  './assets/favicon.ico'
];

// Install: Cache all core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: Cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch: Stale-while-revalidate strategy for assets
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // For TMDB images, use cache-first (they are immutable)
  if (url.hostname === 'image.tmdb.org') {
    event.respondWith(
      caches.open('mcu-images').then((cache) => {
        return cache.match(event.request).then((response) => {
          return response || fetch(event.request).then((networkResponse) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  // For local assets, use stale-while-revalidate
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Update cache with new version
        if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse.clone());
            });
        }
        return networkResponse;
      }).catch(() => {
          // Fallback if network fails
          return cachedResponse;
      });

      return cachedResponse || fetchPromise;
    })
  );
});
