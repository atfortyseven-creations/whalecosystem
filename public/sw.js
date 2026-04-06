const CACHE_NAME = 'sovereign-vault-v1';
const DYNAMIC_CACHE = 'sovereign-dynamic-v1';

const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/official-whale-monochrome.png',
  '/favicon.ico',
];

// Installation: Cache core static dependencies
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// Activation: Clean up stale cryptographic caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME && key !== DYNAMIC_CACHE)
          .map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetching: Real true network-first execution strategy mimicking Native Hybrid Apps
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Bypass API and GraphQL endpoints to ensure data integrity
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/graphql')) {
    return;
  }

  // Network First, fallback to cache for HTML/navigation streams (Offline Capability)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          return caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(event.request, response.clone());
            return response;
          });
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache First, fallback to network for static assets (js, css, images)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (
          !networkResponse || 
          networkResponse.status !== 200 || 
          networkResponse.type !== 'basic' || 
          event.request.method !== 'GET'
        ) {
          return networkResponse;
        }
        
        const responseToCache = networkResponse.clone();
        caches.open(DYNAMIC_CACHE).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      });
    })
  );
});
