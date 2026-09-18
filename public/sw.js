// Minimal service worker, only present so the browser considers this app
// installable (Chrome's install criteria require an active service worker
// with a fetch handler). It deliberately does NOT cache anything: this is
// a live, server-authoritative real-time game, and serving a stale
// response for game state would be actively wrong.
self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request))
})
