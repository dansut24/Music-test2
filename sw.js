// sw.js — Service Worker for background audio keepalive
// Caches the app shell so it loads offline, and keeps the fetch pipeline alive.
const CACHE = “music-locker-v1”;
const SHELL = [”/”, “/index.html”];

self.addEventListener(“install”, function(e) {
e.waitUntil(
caches.open(CACHE).then(function(cache) {
return cache.addAll(SHELL);
})
);
self.skipWaiting();
});

self.addEventListener(“activate”, function(e) {
e.waitUntil(
caches.keys().then(function(keys) {
return Promise.all(keys.filter(function(k) { return k !== CACHE; }).map(function(k) { return caches.delete(k); }));
})
);
self.clients.claim();
});

self.addEventListener(“fetch”, function(e) {
// Let API calls go straight to network
if (e.request.url.includes(”/api/”)) return;
e.respondWith(
caches.match(e.request).then(function(cached) {
return cached || fetch(e.request).catch(function() { return caches.match(”/index.html”); });
})
);
});
