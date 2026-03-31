const CACHE_NAME = "phetchabun-adventure-v1";
const APP_SHELL = [
  "/",
  "/offline.html",
  "/manifest.webmanifest",
  "/app-icon.svg",
  "/alex-avatar.jpg",
  "/temple-arrival.jpg",
  "/prayer-hall.jpg",
  "/temple-wall.jpg",
  "/si-thep-bg.jpg",
  "/si-thep-pano.jpg",
  "/no-entry-sign.jpg",
  "/phu-thap-boek-view.jpg",
  "/phu-thap-boek-market.jpg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL);
    }),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
          return Promise.resolve();
        }),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(async () => {
        return (
          (await caches.match(event.request)) ||
          (await caches.match("/")) ||
          (await caches.match("/offline.html"))
        );
      }),
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(async (cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      try {
        const networkResponse = await fetch(event.request);
        const cache = await caches.open(CACHE_NAME);
        cache.put(event.request, networkResponse.clone());
        return networkResponse;
      } catch {
        return caches.match("/offline.html");
      }
    }),
  );
});
