const CACHE_NAME = 'ppl-workout-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png',
  '/assets/icons/maskable-icon.png',
  '/dev/exercise-data/phase1-week1.json',
  '/dev/exercise-data/phase1-week2.json',
  '/dev/exercise-data/phase1-week3.json',
  '/dev/exercise-data/phase1-week4.json',
  '/dev/exercise-data/phase1-week5.json',
  '/dev/exercise-data/phase1-week6.json',
  '/dev/exercise-data/phase2-week1.json',
  '/dev/exercise-data/phase2-week2.json',
  '/dev/exercise-data/phase2-week3.json',
  '/dev/exercise-data/phase2-week4.json',
  '/dev/exercise-data/phase2-week5.json',
  '/dev/exercise-data/phase2-week6.json',
  '/dev/exercise-data/phase3-week1.json',
  '/dev/exercise-data/phase3-week2.json',
  '/dev/exercise-data/phase3-week3.json',
  '/dev/exercise-data/phase3-week4.json',
  '/dev/exercise-data/phase3-week5.json',
  '/dev/exercise-data/phase3-week6.json'
];

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

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return the response from the cached version
        if (response) {
          return response;
        }
        
        // Not in cache - fetch from network
        return fetch(event.request)
          .then((networkResponse) => {
            // Check if we received a valid response
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            
            // Clone the response
            const responseToCache = networkResponse.clone();
            
            // Add to cache for future use
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            
            return networkResponse;
          });
      })
      .catch((error) => {
        console.error('Fetch failed:', error);
        // You can return a custom offline page here
        // return caches.match('/offline.html');
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