
// AgriPedia Service Worker
// Version 2.0 (Refined Caching and Offline Strategy)

const CACHE_NAME = 'agripedia-cache-v2'; // Main cache for app shell, pages, dynamic assets
const GUIDE_CACHE_NAME = 'agripedia-guides-cache-v1'; // Dedicated cache for guide API responses (if implemented)
// Note: STATIC_CACHE_NAME and DYNAMIC_CACHE_NAME from previous version are consolidated/renamed.

// Assets to pre-cache on install (App Shell)
const PRECACHE_ASSETS = [
  '/',
  '/offline', // Offline fallback page
  '/manifest.webmanifest', // Assuming this is the correct path for the webmanifest
  '/chat',
  '/settings/notifications',
  // Key icons (ensure these paths are correct in your public folder)
  '/images/icons/icon-192x192.png',
  '/images/icons/icon-512x512.png',
  // Add other critical static assets if any (e.g., a logo used on all pages)
];

// URLs to cache with a cache-first strategy (images, fonts, etc.)
const CACHE_FIRST_PATTERNS = [
  /https:\/\/placehold\.co\/.*/, // Placeholder images
  /\.(?:png|gif|jpg|jpeg|svg|webp)$/, // Local images
  /\.(?:woff|woff2|ttf|otf)$/, // Fonts
];

self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install event');
  event.waitUntil(
    caches.open(CACHE_NAME) // Use the new main cache name
      .then((cache) => {
        console.log('[Service Worker] Pre-caching core assets:', PRECACHE_ASSETS);
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        console.log('[Service Worker] Core assets pre-cached successfully.');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[Service Worker] Pre-caching failed:', error);
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activate event');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME && cacheName !== GUIDE_CACHE_NAME) // Check against new names
          .map((cacheName) => {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    }).then(() => {
      console.log('[Service Worker] Old caches cleaned up.');
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // For navigation requests (HTML pages), try network first, then cache, then offline page
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
           // If network successful, cache the page for future offline use
           if (response.ok) {
               caches.open(CACHE_NAME).then(cache => { // Use main cache
                   console.log('[Service Worker] Caching page:', request.url);
                   cache.put(request, response.clone());
               });
           }
           return response;
        })
        .catch(() => {
          console.log(`[Service Worker] Network request for page ${request.url} failed, attempting cache.`);
          return caches.match(request)
            .then(response => response || caches.match('/offline').then(offlineResponse => {
                if (offlineResponse) return offlineResponse;
                // Fallback if /offline itself is not cached for some reason (should be precached)
                return new Response("You are offline and the offline page is not available.", {
                    status: 503,
                    headers: { 'Content-Type': 'text/plain' }
                });
            }));
        })
    );
    return;
  }

  // Strategy for API calls to fetch guide data (if an API route like /api/guides/:id is created)
  // if (url.pathname.startsWith('/api/guides/')) {
  //   event.respondWith(
  //     caches.open(GUIDE_CACHE_NAME).then(cache => { // Use dedicated guide cache
  //       return cache.match(request).then(cachedResponse => {
  //         const fetchPromise = fetch(request).then(networkResponse => {
  //           if (networkResponse.ok) {
  //             cache.put(request, networkResponse.clone());
  //           }
  //           return networkResponse;
  //         });
  //         return cachedResponse || fetchPromise; // Cache first, then network
  //       });
  //     })
  //   );
  //   return;
  // }

  // For other static assets (CSS, JS, images not covered by precache), use cache-first
  // This simplifies from the previous version's multiple strategies for static assets.
  // Next.js build artifacts in _next/static are generally versioned, making cache-first safe.
  if (request.method === 'GET' &&
      (url.origin === self.location.origin || CACHE_FIRST_PATTERNS.some(pattern => pattern.test(url.href)))) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => { // Use main cache
        return cache.match(request).then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(request).then(networkResponse => {
            if (networkResponse.ok) {
              // console.log('[Service Worker] Caching new asset:', request.url);
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          });
        });
      })
      .catch(() => {
        // For images, could return a placeholder offline image
        if (request.headers.get('accept')?.includes('image')) {
          // return caches.match('/placeholder-offline.png'); // Ensure placeholder exists and is precached
        }
        // Generic fallback for other asset types if needed
        return new Response("Asset not available offline", { status: 404, headers: { 'Content-Type': 'text/plain'}});
      })
    );
    return;
  }

  // Default: Let the browser handle it (e.g., for external APIs not matched above)
  // console.log('[Service Worker] Bypassing SW for request:', request.url);
  // event.respondWith(fetch(request)); // This line was removed as the above should cover most GETs.
                                      // Non-GET requests or unhandled GETs will pass through by default if no event.respondWith.
});


// Basic Push Notification Listener (can be expanded)
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push Received.');
  const data = event.data ? event.data.json() : { title: 'AgriPedia', body: 'New update available!' };

  // TODO: Enhance notification logic for AgriPedia features
  // - Check notification type (e.g., 'watering', 'pruning', 'harvesting')
  // - Customize title and body based on plant name, task, and due date from payload
  // - Potentially add actions like 'View Plant' or 'Mark as Complete'
  // - Example: if (data.type === 'watering_reminder') { title = `Water ${data.plantName}!`; ... }
  
  const title = data.title || 'AgriPedia Notification';
  const options = {
    body: data.body || 'Something new happened!',
    icon: data.icon || '/icons/icon-192x192.png', // Ensure you have this icon
    badge: data.badge || '/icons/badge-72x72.png', // Ensure you have this icon
    // Other options: image, actions, data, etc.
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification click Received.');
  event.notification.close();
  // Example: Open a specific URL or focus an existing window
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window matching the app is already open, focus it.
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) { // Adjust URL if needed
          return client.focus();
        }
      }
      // If no window is open, open a new one.
      if (clients.openWindow) {
        return clients.openWindow('/'); // Adjust URL if needed
      }
    })
  );
});
