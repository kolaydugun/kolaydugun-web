// Basic Service Worker for KolayDugun PWA
const CACHE_NAME = 'kolaydugun-v1';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
    // Basic pass-through fetch for now
    event.respondWith(fetch(event.request));
});
