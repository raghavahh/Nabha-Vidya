const CACHE_NAME = "vidya-cache-v1";

// List of files to cache (update paths to match your project)
const ASSETS = [
  "/",
  "/index.html",
  "/student-dashboard.html",
  "/teacher-dashboard.html",
  "/css/styles.css",
  "/js/script.js",
  "/assets/icons/icon-512.png",
  "/assets/icons/icon-192.png",
  "/assets/icons/icon-512.png"
];

// Helper: check if a file exists before caching
async function safeCacheAdd(cache, url) {
  try {
    const response = await fetch(url, { method: "GET" });
    if (!response.ok) throw new Error(`Failed to fetch ${url}`);
    await cache.put(url, response.clone());
    console.log(`Cached: ${url}`);
  } catch (err) {
    console.warn(`Skipped caching: ${url} (${err.message})`);
  }
}

// Install Service Worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await Promise.all(ASSETS.map((asset) => safeCacheAdd(cache, asset)));
    })
  );
});

// Fetch from cache, fallback to network
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedRes) => {
      return (
        cachedRes ||
        fetch(event.request).then((networkRes) =>
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkRes.clone());
            return networkRes;
          })
        ).catch(() => {
          // Optional: fallback page if offline
          if (event.request.mode === "navigate") {
            return caches.match("/index.html");
          }
        })
      );
    })
  );
});

// Activate Service Worker and remove old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
});
