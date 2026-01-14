// public/sw.js
self.addEventListener('install', (e) => {
  console.log('[SW] Instalado');
  // Activa el SW inmediatamente sin esperar al cierre de pestañas
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  console.log('[SW] Activado');
  // Toma el control de todas las páginas inmediatamente
  e.waitUntil(self.clients.claim());
});

// Intercepta las peticiones; aquí no cacheamos nada, solo proxy al network
self.addEventListener('fetch', (e) => {
  e.respondWith(fetch(e.request));
});
