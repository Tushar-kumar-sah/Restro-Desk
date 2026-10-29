/**
 * RestoDesk Service Worker (PWA Offline Capability & Cache)
 */

const CACHE_NAME = 'restodesk-cache-v1';
const OFFLINE_URLS = [
  '/',
  '/pos',
  '/dashboard',
  '/tables',
  '/kitchen',
  '/manifest.json',
];

// Install event: Pre-cache core app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(OFFLINE_URLS).catch((err) => {
        console.warn('Pre-cache partial failure:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate event: Clean up legacy caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event: Network-first strategy with cache fallback for offline resilience
self.addEventListener('fetch', (event) => {
  // Pass non-GET and API mutations directly
  if (event.request.method !== 'GET') {
    return;
  }

  // Handle static page / asset requests
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Cache valid responses for static assets
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          (event.request.url.includes('/_next/static/') || event.request.url.includes('/icons/'))
        ) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        // Network failed (offline): attempt cache match
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        // Fallback for navigation
        if (event.request.mode === 'navigate') {
          return caches.match('/pos') || caches.match('/');
        }
      })
  );
});
