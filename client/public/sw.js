// Service Worker for offline functionality
const CACHE_NAME = 'ai-learning-hub-v1';
const API_CACHE_NAME = 'ai-learning-api-v1';

// Cache static assets
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/index.css'
];

// Cache API endpoints for offline access
const API_ENDPOINTS = [
  '/api/auth/user',
  '/api/resources',
  '/api/stats',
  '/api/activity',
  '/api/goals',
  '/api/paths',
  '/api/timeline'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      }),
      caches.open(API_CACHE_NAME)
    ])
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests with network-first strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful responses
          if (response.ok && request.method === 'GET') {
            const responseClone = response.clone();
            caches.open(API_CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Return cached response when offline
          return caches.match(request).then((cached) => {
            if (cached) {
              return cached;
            }
            // Return offline indicator for non-cached API requests
            return new Response(
              JSON.stringify({ 
                error: 'offline', 
                message: 'You are currently offline. Some features may be limited.' 
              }),
              { 
                status: 200,
                headers: { 'Content-Type': 'application/json' }
              }
            );
          });
        })
    );
    return;
  }

  // Handle static assets with cache-first strategy
  event.respondWith(
    caches.match(request).then((cached) => {
      return cached || fetch(request).then((response) => {
        // Cache successful responses
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      });
    })
  );
});

// Handle background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'offline-sync') {
    event.waitUntil(syncOfflineData());
  }
});

// Sync offline data when back online
async function syncOfflineData() {
  try {
    const offlineActions = await getOfflineActions();
    
    for (const action of offlineActions) {
      try {
        await fetch(action.url, {
          method: action.method,
          headers: action.headers,
          body: action.body
        });
        
        // Remove successfully synced action
        await removeOfflineAction(action.id);
      } catch (error) {
        console.log('Failed to sync action:', action.id);
      }
    }
  } catch (error) {
    console.log('Sync failed:', error);
  }
}

// Helper functions for offline data management
async function getOfflineActions() {
  // These would typically read from IndexedDB
  return [];
}

async function removeOfflineAction(id) {
  // Remove from IndexedDB
}