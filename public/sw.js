// Service Worker for Eden Avenue Management PWA
const CACHE_NAME = 'eden-avenue-v2' // Updated version to force cache refresh
const RUNTIME_CACHE = 'eden-avenue-runtime-v2'

// Assets to cache on install
const STATIC_ASSETS = ['/', '/dashboard', '/auth/login', '/manifest.json', '/offline.html']

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing...')
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[Service Worker] Caching static assets')
      return cache.addAll(STATIC_ASSETS).catch(err => {
        console.log('[Service Worker] Cache addAll failed:', err)
      })
    })
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating...')
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => {
            return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE
          })
          .map(cacheName => {
            console.log('[Service Worker] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          })
      )
    })
  )
  return self.clients.claim()
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return
  }

  // Skip API requests (always use network)
  if (event.request.url.includes('/api/')) {
    return
  }

  // Skip Next.js internal requests (always use network for fresh content)
  if (event.request.url.includes('/_next/')) {
    return
  }

  // In development, always fetch from network first
  const isDev = self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1'

  if (isDev) {
    // Development: Network first, cache as fallback
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache successful responses
          if (response && response.status === 200 && response.type === 'basic') {
            const responseToCache = response.clone()
            caches.open(RUNTIME_CACHE).then(cache => {
              cache.put(event.request, responseToCache)
            })
          }
          return response
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse
            }
            // If offline and page request, return offline page
            if (event.request.destination === 'document') {
              return caches.match('/offline.html')
            }
          })
        })
    )
  } else {
    // Production: Cache first, network as fallback
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        // Return cached version if available
        if (cachedResponse) {
          return cachedResponse
        }

        // Otherwise fetch from network
        return fetch(event.request)
          .then(response => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response
            }

            // Clone the response
            const responseToCache = response.clone()

            // Cache the response
            caches.open(RUNTIME_CACHE).then(cache => {
              cache.put(event.request, responseToCache)
            })

            return response
          })
          .catch(() => {
            // If offline and page request, return offline page
            if (event.request.destination === 'document') {
              return caches.match('/offline.html')
            }
          })
      })
    )
  }
})

// Push notification event
self.addEventListener('push', event => {
  console.log('[Service Worker] Push notification received')

  const data = event.data ? event.data.json() : {}
  const title = data.title || 'Eden Avenue Management'
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: data.tag || 'notification',
    data: data.url || '/',
    requireInteraction: false,
    actions: data.actions || [],
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

// Notification click event
self.addEventListener('notificationclick', event => {
  console.log('[Service Worker] Notification clicked')
  event.notification.close()

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      // If app is already open, focus it
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus()
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        const url = event.notification.data || '/'
        return clients.openWindow(url)
      }
    })
  )
})

// Background sync (for offline form submissions)
self.addEventListener('sync', event => {
  console.log('[Service Worker] Background sync:', event.tag)

  if (event.tag === 'sync-requests') {
    event.waitUntil(syncRequests())
  }
})

async function syncRequests() {
  // This would sync any pending requests that were created offline
  // Implementation depends on your offline storage strategy
  console.log('[Service Worker] Syncing requests...')
}
