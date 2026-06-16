// =============================================
// MoneyShop - Service Worker
// Web Push Bildirimleri için Service Worker
// =============================================

const CACHE_NAME = "moneyshop-v1";

// Service Worker kurulduğunda
self.addEventListener("install", (event) => {
  console.log("[SW] Service Worker kuruldu.");
  // Yeni SW hemen aktif olsun (bekleyen worker'ı bekleme)
  self.skipWaiting();
});

// Service Worker aktif olduğunda
self.addEventListener("activate", (event) => {
  console.log("[SW] Service Worker aktif.");
  // Eski cache'leri temizle
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  // Kontrolü hemen devral
  clients.claim();
});

// Push bildirimi geldiğinde
self.addEventListener("push", (event) => {
  console.log("[SW] Push bildirimi alındı.");

  let payload = {
    title: "MoneyShop",
    body: "Yeni bir bildiriminiz var.",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-96x96.png",
    url: "/dashboard",
    tag: "default",
    data: {},
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      payload = { ...payload, ...parsed };
    } catch {
      // JSON değilse düz metin olarak göster
      payload.body = event.data.text();
    }
  }

  const options = {
    body: payload.body,
    icon: payload.icon,
    badge: payload.badge,
    tag: payload.tag,
    data: {
      url: payload.url,
      ...payload.data,
    },
    vibrate: [200, 100, 200],
    requireInteraction: false,
    silent: false,
  };

  event.waitUntil(self.registration.showNotification(payload.title, options));
});

// Bildirime tıklandığında
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Bildirime tıklandı.");

  event.notification.close();

  const urlToOpen = event.notification.data?.url || "/dashboard";

  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((windowClients) => {
        // Açık pencere varsa onu kullan
        for (const client of windowClients) {
          if (client.url === urlToOpen && "focus" in client) {
            return client.focus();
          }
        }
        // Yoksa yeni pencere aç
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});
