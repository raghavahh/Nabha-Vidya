const CACHE_NAME = "nabha-vidya-v2.0";
const STATIC_CACHE = "nabha-static-v2.0";
const DYNAMIC_CACHE = "nabha-dynamic-v2.0";

// Static assets to cache immediately
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/student-dashboard.html", 
  "/teacher-dashboard.html",
  "/styles.css",
  "/script.js",
  "/manifest.json",
  "/logo-removebg-preview.png",
  "/assets/icons/icon-192.png",
  "/assets/icons/icon-512.png"
];

// Video files and other large assets (cache on demand)
const DYNAMIC_ASSETS = [
  "/assets/videos/",
  "/api/"
];

// Helper: Safe cache addition with error handling
async function safeCacheAdd(cache, url) {
  try {
    const response = await fetch(url, { 
      method: "GET",
      cache: "no-cache" 
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status}`);
    }
    
    await cache.put(url, response.clone());
    console.log(`✅ Cached: ${url}`);
    return true;
  } catch (err) {
    console.warn(`⚠️ Skipped caching: ${url} (${err.message})`);
    return false;
  }
}

// Install Service Worker - Cache static assets
self.addEventListener("install", (event) => {
  console.log("📦 Service Worker: Installing...");
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE).then(async (cache) => {
        console.log("Caching static assets...");
        const results = await Promise.allSettled(
          STATIC_ASSETS.map(asset => safeCacheAdd(cache, asset))
        );
        
        const successful = results.filter(r => r.status === 'fulfilled').length;
        console.log(`Static assets cached: ${successful}/${STATIC_ASSETS.length}`);
      }),
      
      // Initialize dynamic cache
      caches.open(DYNAMIC_CACHE).then(() => {
        console.log("Dynamic cache initialized");
      })
    ])
  );
  
  // Force activation of new service worker
  self.skipWaiting();
});

// Activate Service Worker - Clean up old caches
self.addEventListener("activate", (event) => {
  console.log("🚀 Service Worker: Activating...");
  
  event.waitUntil(
    Promise.all([
      // Delete old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter(cacheName => 
              cacheName !== STATIC_CACHE && 
              cacheName !== DYNAMIC_CACHE &&
              cacheName.startsWith('nabha-')
            )
            .map(cacheName => {
              console.log(`🗑️ Deleting old cache: ${cacheName}`);
              return caches.delete(cacheName);
            })
        );
      }),
      
      // Take control of all pages
      self.clients.claim()
    ])
  );
});

// Fetch Strategy: Cache First for static, Network First for dynamic
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip Chrome extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  event.respondWith(handleFetch(request));
});

async function handleFetch(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  try {
    // Strategy 1: Cache First for static assets
    if (isStaticAsset(pathname)) {
      return await cacheFirst(request, STATIC_CACHE);
    }
    
    // Strategy 2: Network First for dynamic content
    if (isDynamicAsset(pathname)) {
      return await networkFirst(request, DYNAMIC_CACHE);
    }
    
    // Strategy 3: Stale While Revalidate for API calls
    if (pathname.startsWith('/api/')) {
      return await staleWhileRevalidate(request, DYNAMIC_CACHE);
    }
    
    // Strategy 4: Network First with cache fallback for everything else
    return await networkFirst(request, DYNAMIC_CACHE);
    
  } catch (error) {
    console.error('Fetch error:', error);
    return await handleOfflineFallback(request);
  }
}

// Cache First Strategy
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    console.log(`📁 Cache hit: ${request.url}`);
    return cachedResponse;
  }
  
  console.log(`🌐 Network fetch: ${request.url}`);
  const networkResponse = await fetch(request);
  
  if (networkResponse.ok) {
    await cache.put(request, networkResponse.clone());
  }
  
  return networkResponse;
}

// Network First Strategy
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  
  try {
    console.log(`🌐 Network first: ${request.url}`);
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      await cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log(`📁 Network failed, trying cache: ${request.url}`);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// Stale While Revalidate Strategy
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  // Always fetch in background to update cache
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(err => {
    console.warn('Background fetch failed:', err);
  });
  
  // Return cached version immediately if available
  if (cachedResponse) {
    console.log(`📁 Stale cache served: ${request.url}`);
    return cachedResponse;
  }
  
  // Otherwise wait for network
  console.log(`🌐 Fresh fetch: ${request.url}`);
  return await fetchPromise;
}

// Offline Fallback Handler
async function handleOfflineFallback(request) {
  const url = new URL(request.url);
  
  // Return offline page for navigation requests
  if (request.mode === 'navigate') {
    const cache = await caches.open(STATIC_CACHE);
    const fallback = await cache.match('/index.html');
    
    if (fallback) {
      return fallback;
    }
  }
  
  // Return cached version if available
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Return a basic offline response
  return new Response(
    JSON.stringify({
      error: 'Offline',
      message: 'This content is not available offline'
    }),
    {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

// Helper functions
function isStaticAsset(pathname) {
  return pathname.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/) ||
         pathname === '/' ||
         pathname.endsWith('.html');
}

function isDynamicAsset(pathname) {
  return pathname.startsWith('/assets/videos/') ||
         pathname.includes('api') ||
         pathname.includes('user-content');
}

// Background Sync for offline form submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'feedback-submission') {
    event.waitUntil(syncFeedbackSubmissions());
  }
});

async function syncFeedbackSubmissions() {
  try {
    // Get pending submissions from IndexedDB or cache
    const pendingSubmissions = await getPendingSubmissions();
    
    for (const submission of pendingSubmissions) {
      try {
        await submitFeedback(submission);
        await removePendingSubmission(submission.id);
        console.log('✅ Synced feedback submission:', submission.id);
      } catch (error) {
        console.error('❌ Failed to sync submission:', error);
      }
    }
  } catch (error) {
    console.error('Background sync error:', error);
  }
}

// Push notification handler
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body || 'New notification from Nabha Vidya',
    icon: '/assets/icons/icon-192.png',
    badge: '/assets/icons/icon-192.png',
    tag: data.tag || 'nabha-notification',
    data: data.data || {},
    actions: [
      {
        action: 'open',
        title: 'Open App'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Nabha Vidya', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Placeholder functions (implement based on your backend)
async function getPendingSubmissions() {
  // Implement based on your storage solution
  return [];
}

async function removePendingSubmission(id) {
  // Implement based on your storage solution
  return true;
}

async function submitFeedback(submission) {
  // Implement based on your API
  return fetch('/api/feedback', {
    method: 'POST',
    body: JSON.stringify(submission),
    headers: { 'Content-Type': 'application/json' }
  });
}

// Version info
console.log("🎓 Nabha Vidya Service Worker v2.0 loaded successfully!");
console.log("📊 Cache Strategy: Static assets (Cache First), Dynamic content (Network First)");
console.log("🔄 Background Sync: Enabled for form submissions");
console.log("🔔 Push Notifications: Ready");
