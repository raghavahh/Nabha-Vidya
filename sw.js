const CACHE_NAME = "vidya-cache-v1";
const ASSETS = [
  "/",
  "/index.html",
  "/student-dashboard.html",
  "/teacher-dashboard.html",
  "/css/styles.css",
  "/js/script.js",
  "/assets/logo-removebg-preview.png",
  "/assets/icons/icon-192.png",
  "/assets/icons/icon-512.png"
];

// Install Service Worker
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

// Fetch and Cache
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(res => {
      return (
        res ||
        fetch(event.request).then(fetchRes =>
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, fetchRes.clone());
            return fetchRes;
          })
        )
      );
    })
  );
});

// Activate Service Worker
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
});