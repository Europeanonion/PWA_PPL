const CACHE_NAME = 'ppl-workout-v8';
const ASSETS_TO_CACHE = [
  '/PWA_PPL/',
  '/PWA_PPL/index.html',
  '/PWA_PPL/offline.html',
  '/PWA_PPL/manifest.json',
  '/PWA_PPL/assets/css/modern-ui.min.css',
  '/PWA_PPL/assets/css/weight-tracker.min.css',
  '/PWA_PPL/assets/js/workout-storage.min.js',
  '/PWA_PPL/assets/js/exercise-inputs.min.js',
  '/PWA_PPL/assets/js/progress-tracker.min.js',
  '/PWA_PPL/assets/js/network-status.min.js',
  '/PWA_PPL/assets/js/workout-loader.min.js',
  '/PWA_PPL/assets/icons/optimized/Icon-192.png',
  '/PWA_PPL/assets/icons/optimized/icon-512.png',
  '/PWA_PPL/assets/icons/optimized/maskable-icon.png',
  '/PWA_PPL/favicon.ico',
  '/PWA_PPL/dev/exercise-data/phase1-week1.json',
  '/PWA_PPL/dev/exercise-data/phase1-week2.json',
  '/PWA_PPL/dev/exercise-data/phase1-week3.json',
  '/PWA_PPL/dev/exercise-data/phase1-week4.json',
  '/PWA_PPL/dev/exercise-data/phase1-week5.json',
  '/PWA_PPL/dev/exercise-data/phase1-week6.json',
  '/PWA_PPL/dev/exercise-data/phase2-week1.json',
  '/PWA_PPL/dev/exercise-data/phase2-week2.json',
  '/PWA_PPL/dev/exercise-data/phase2-week3.json',
  '/PWA_PPL/dev/exercise-data/phase2-week4.json',
  '/PWA_PPL/dev/exercise-data/phase2-week5.json',
  '/PWA_PPL/dev/exercise-data/phase2-week6.json',
  '/PWA_PPL/dev/exercise-data/phase3-week1.json',
  '/PWA_PPL/dev/exercise-data/phase3-week2.json',
  '/PWA_PPL/dev/exercise-data/phase3-week3.json',
  '/PWA_PPL/dev/exercise-data/phase3-week4.json',
  '/PWA_PPL/dev/exercise-data/phase3-week5.json',
  '/PWA_PPL/dev/exercise-data/phase3-week6.json'
];

// Offline fallback page
const OFFLINE_PAGE = '/PWA_PPL/offline.html';

// Install event - cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .catch((error) => {
        console.error('Pre-caching failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - serve from cache, network, or offline fallback
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Handle HTML navigation requests differently (for offline fallback)
  if (event.request.mode === 'navigate' ||
      (event.request.method === 'GET' &&
       event.request.headers.get('accept').includes('text/html'))) {
    
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // If navigation fails, show offline page
          return caches.match(OFFLINE_PAGE)
            .then(response => {
              if (response) {
                return response;
              }
              // If offline page is not in cache, try to fetch it
              return fetch(OFFLINE_PAGE)
                .catch(() => {
                  // If all else fails, return a simple offline message
                  return new Response(
                    '<html><body><h1>You are offline</h1><p>Please check your internet connection.</p></body></html>',
                    { headers: { 'Content-Type': 'text/html' } }
                  );
                });
            });
        })
    );
    return;
  }

  // For all other requests, use a stale-while-revalidate strategy
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Use cached version if available
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            // Check if we received a valid response
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
              // Clone the response
              const responseToCache = networkResponse.clone();
              
              // Add to cache for future use
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
            }
            return networkResponse;
          })
          .catch((error) => {
            console.error('Fetch failed:', error);
            
            // For API requests or JSON data, return a specific error
            if (event.request.url.includes('/dev/exercise-data/')) {
              return new Response(JSON.stringify({
                error: 'You are offline. Some workout data may not be available.'
              }), {
                headers: { 'Content-Type': 'application/json' }
              });
            }
            
            // For other resources, just let the cache handle it
            return new Response('Network request failed. Using cached version if available.');
          });

        // Return the cached response if we have one, otherwise wait for the network response
        return cachedResponse || fetchPromise;
      })
  );
});

// Handle data sync for offline changes
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-workout-data') {
    event.waitUntil(syncWorkoutData());
  }
});

// Function to sync workout data with server (if implemented)
function syncWorkoutData() {
  // This would be implemented if we add server sync functionality
  return Promise.resolve();
}