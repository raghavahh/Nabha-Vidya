const CACHE_NAME = 'nabha-vidya-v1.0';
const STATIC_CACHE = 'nabha-static-v1.0';
const DYNAMIC_CACHE = 'nabha-dynamic-v1.0';

// Base path for GitHub Pages
const BASE_PATH = '/Nabha-Vidya';

// Static assets that should be cached immediately
const STATIC_ASSETS = [
  `${BASE_PATH}/`,
  `${BASE_PATH}/index.html`,
  `${BASE_PATH}/student-dashboard.html`,
  `${BASE_PATH}/teacher-dashboard.html`,
  `${BASE_PATH}/styles.css`,
  `${BASE_PATH}/script.js`,
  `${BASE_PATH}/manifest.json`,
  `${BASE_PATH}/logo-removebg-preview.png`,
  // Add your icons when created
  `${BASE_PATH}/icons/icon-192.png`,
  `${BASE_PATH}/icons/icon-512.png`
];

// Install event - Cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static assets...');
        return cache.addAll(STATIC_ASSETS.map(url => new Request(url, {cache: 'reload'})));
      })
      .catch((error) => {
        console.error('Service Worker: Cache installation failed:', error);
      })
  );
  
  self.skipWaiting();
});

// Activate event - Clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    Promise.all([
      // Delete old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter(cacheName => 
              cacheName !== STATIC_CACHE && 
              cacheName !== DYNAMIC_CACHE &&
              cacheName.includes('nabha')
            )
            .map(cacheName => {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      }),
      // Take control of all open pages
      self.clients.claim()
    ])
  );
});

// Fetch event - Serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip chrome-extension and other protocols
  if (!event.request.url.startsWith('http')) return;
  
  event.respondWith(
    handleFetch(event.request)
  );
});

async function handleFetch(request) {
  const url = new URL(request.url);
  
  try {
    // For navigation requests (HTML pages)
    if (request.mode === 'navigate') {
      return await handleNavigation(request);
    }
    
    // For static assets (CSS, JS, images)
    if (isStaticAsset(request.url)) {
      return await cacheFirst(request, STATIC_CACHE);
    }
    
    // For dynamic content and API calls
    return await networkFirst(request, DYNAMIC_CACHE);
    
  } catch (error) {
    console.error('Fetch error:', error);
    return await handleOffline(request);
  }
}

// Handle navigation requests with cache fallback
async function handleNavigation(request) {
  try {
    // Try network first for navigation
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    throw new Error('Network response not ok');
  } catch (error) {
    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback to index.html for SPA routing
    const indexResponse = await caches.match(`${BASE_PATH}/index.html`);
    if (indexResponse) {
      return indexResponse;
    }
    
    // Last resort - offline page
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Nabha Vidya - Offline</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { 
              font-family: Arial, sans-serif; 
              text-align: center; 
              padding: 50px; 
              background: #f5f5f5; 
            }
            .offline-container { 
              background: white; 
              padding: 40px; 
              border-radius: 10px; 
              box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
              max-width: 500px; 
              margin: 0 auto; 
            }
            .offline-icon { 
              font-size: 64px; 
              margin-bottom: 20px; 
            }
            h1 { 
              color: #1a73e8; 
              margin-bottom: 20px; 
            }
            p { 
              color: #666; 
              line-height: 1.6; 
            }
            .retry-btn {
              background: #1a73e8;
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 6px;
              cursor: pointer;
              font-size: 16px;
              margin-top: 20px;
            }
            .retry-btn:hover {
              background: #1557b0;
            }
          </style>
        </head>
        <body>
          <div class="offline-container">
            <div class="offline-icon">📚</div>
            <h1>Nabha Vidya</h1>
            <h2>You're Offline</h2>
            <p>It looks like you're not connected to the internet. Some features may not be available, but you can still access previously viewed content.</p>
            <button class="retry-btn" onclick="window.location.reload()">Try Again</button>
          </div>
        </body>
      </html>
    `, {
      status: 200,
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

// Cache first strategy for static assets
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  const networkResponse = await fetch(request);
  if (networkResponse.ok) {
    cache.put(request, networkResponse.clone());
  }
  
  return networkResponse;
}

// Network first strategy for dynamic content
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Handle completely offline scenarios
async function handleOffline(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Return a basic offline response
  if (request.destination === 'image') {
    // Return a placeholder for images
    return new Response(
      `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150">
        <rect width="200" height="150" fill="#f0f0f0"/>
        <text x="100" y="75" text-anchor="middle" fill="#999" font-family="Arial" font-size="14">
          Image Offline
        </text>
      </svg>`,
      { 
        headers: { 'Content-Type': 'image/svg+xml' },
        status: 200 
      }
    );
  }
  
  return new Response('Content not available offline', {
    status: 503,
    headers: { 'Content-Type': 'text/plain' }
  });
}

// Helper function to determine if URL is a static asset
function isStaticAsset(url) {
  return url.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|mp4|webm|ogg)$/);
}

// Background sync for form submissions when back online
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(syncPendingData());
  }
});

async function syncPendingData() {
  try {
    // Get pending data from IndexedDB or localStorage
    const pendingData = await getPendingData();
    
    for (const item of pendingData) {
      try {
        await fetch('/api/sync', {
          method: 'POST',
          body: JSON.stringify(item),
          headers: { 'Content-Type': 'application/json' }
        });
        
        await removePendingData(item.id);
      } catch (error) {
        console.error('Failed to sync data:', error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Placeholder functions - implement based on your data storage needs
async function getPendingData() {
  return JSON.parse(localStorage.getItem('pendingData') || '[]');
}

async function removePendingData(id) {
  const pending = await getPendingData();
  const updated = pending.filter(item => item.id !== id);
  localStorage.setItem('pendingData', JSON.stringify(updated));
}

// Push notification handling
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  
  const options = {
    body: data.body || 'New update available',
    icon: `${BASE_PATH}/icons/icon-192.png`,
    badge: `${BASE_PATH}/icons/icon-192.png`,
    tag: 'nabha-notification',
    data: data,
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: `${BASE_PATH}/icons/icon-192.png`
      },
      {
        action: 'close',
        title: 'Close'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Nabha Vidya', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'view' || !event.action) {
    event.waitUntil(
      clients.openWindow(`${BASE_PATH}/`)
    );
  }
});

console.log('Nabha Vidya Service Worker loaded successfully!');
