
// public/sw.js

self.addEventListener('install', (event) => {
  console.log('AgriPedia Service Worker: Installing...');
  // event.waitUntil(caches.open('agripedia-cache-v1').then(...)); // Optional: Caching assets
  self.skipWaiting(); // Activate worker immediately
});

self.addEventListener('activate', (event) => {
  console.log('AgriPedia Service Worker: Activating...');
  // event.waitUntil(clients.claim()); // Optional: Take control of open clients
});

self.addEventListener('fetch', (event) => {
  // Optional: Implement caching strategies (e.g., cache-first, network-first)
  // For now, just pass through:
  // event.respondWith(fetch(event.request));
});

self.addEventListener('push', (event) => {
  console.log('AgriPedia Service Worker: Push Received.');
  console.log(`[Service Worker] Push had this data: "${event.data ? event.data.text() : 'no data'}"`);

  const title = 'AgriPedia Notification';
  const options = {
    body: event.data ? event.data.text() : 'Something new from AgriPedia!',
    icon: 'https://placehold.co/192x192.png', // Replace with actual app icon
    badge: 'https://placehold.co/96x96.png',  // Replace with actual app badge
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  console.log('AgriPedia Service Worker: Notification click Received.');
  event.notification.close();
  // Optional: Focus or open a window
  // event.waitUntil(
  //   clients.matchAll({ type: 'window' }).then((clientsArr) => {
  //     const hadWindowToFocus = clientsArr.some((windowClient) =>
  //       windowClient.url === '/' ? (windowClient.focus(), true) : false
  //     );
  //     if (!hadWindowToFocus)
  //       clients.openWindow('/').then((windowClient) => (windowClient ? windowClient.focus() : null));
  //   })
  // );
});
