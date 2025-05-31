
// AgriPedia Service Worker
// Version 1.1 (Enhanced Caching)

const CACHE_VERSION = 'agripedia-v1.1';
const STATIC_CACHE_NAME = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE_NAME = `dynamic-${CACHE_VERSION}`;

// Assets to pre-cache on install
const PRECACHE_ASSETS = [
  '/',                // Homepage
  '/offline',         // Offline fallback page
  // Add paths to your main CSS and JS bundles if known and stable
  // e.g., '/_next/static/css/main.css', '/_next/static/chunks/main-app.js'
  // For Next.js, these filenames can change, so pre-caching them directly can be tricky.
  // Focus on core pages and let dynamic caching handle assets.
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
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Pre-caching core assets:', PRECACHE_ASSETS);
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        console.log('[Service Worker] Core assets pre-cached successfully.');
        return self.skipWaiting(); // Activate worker immediately
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
          .filter((cacheName) => cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME)
          .map((cacheName) => {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    }).then(() => {
      console.log('[Service Worker] Old caches cleaned up.');
      return self.clients.claim(); // Take control of all open clients
    })
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // For navigation requests (HTML pages)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          // If successful, cache and return the response
          // Optional: Cache navigation responses in DYNAMIC_CACHE if desired
          return response;
        })
        .catch(() => {
          // If network fails, serve the offline page from pre-cache
          console.log(`[Service Worker] Network request for ${request.url} failed, serving offline page.`);
          return caches.match('/offline');
        })
    );
    return;
  }

  // Cache-first for specific patterns (images, fonts)
  if (CACHE_FIRST_PATTERNS.some(pattern => pattern.test(url.href))) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // console.log('[Service Worker] Serving from static cache:', request.url);
          return cachedResponse;
        }
        return fetch(request).then((networkResponse) => {
          return caches.open(STATIC_CACHE_NAME).then((cache) => {
            // console.log('[Service Worker] Caching new static asset:', request.url);
            cache.put(request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
    return;
  }
  
  // Default: Stale-while-revalidate for other assets (JS, CSS chunks from _next)
  // This ensures app loads fast from cache, then updates in background if network available.
  if (url.origin === self.location.origin && url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.open(DYNAMIC_CACHE_NAME).then(cache => {
        return cache.match(request).then(cachedResponse => {
          const fetchPromise = fetch(request).then(networkResponse => {
            if (networkResponse.ok) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(err => {
            console.warn(`[Service Worker] Fetch failed for ${request.url}, serving from cache if available. Error: ${err}`);
            // If fetch fails and it was cached, return the cached version
            if (cachedResponse) return cachedResponse;
            // Otherwise, it will propagate the fetch error
            throw err; 
          });

          // Return cached response immediately if available, then fetch and update cache
          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }


  // For other requests, try network first, then cache (Network falling back to cache)
  // Good for API calls or content we want to be fresh if possible.
  // However, for this app, most crucial things are pages or static assets already handled.
  // So, a simple fetch or cache-first is often enough.
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      return cachedResponse || fetch(request).then((networkResponse) => {
        // Optionally cache other successful GET requests
        if (request.method === 'GET' && networkResponse.ok) {
          return caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
            // Be selective about what goes into dynamic cache to avoid bloating it.
            // cache.put(request, networkResponse.clone());
            return networkResponse;
          });
        }
        return networkResponse;
      });
    })
  );
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
