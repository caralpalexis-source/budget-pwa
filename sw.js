// sw.js
self.addEventListener("install", event => {
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  self.clients.claim();
});

// fetch volontairement vide pour l’instant
self.addEventListener("fetch", event => {});