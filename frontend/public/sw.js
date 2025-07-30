const CACHE_NAME = "watchedit-v1";
const urlsToCache = [
  "/",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

// 安裝 Service Worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache");
      return cache.addAll(urlsToCache);
    })
  );
});

// 攔截網路請求
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // 如果快取中有回應，則返回快取的回應
      if (response) {
        return response;
      }

      // 否則從網路獲取
      return fetch(event.request).then((response) => {
        // 檢查是否為有效的回應
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }

        // 複製回應
        const responseToCache = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      });
    })
  );
});

// 更新 Service Worker
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 處理背景同步
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    event.waitUntil(doBackgroundSync());
  }
});

// 處理推送通知
self.addEventListener("push", (event) => {
  const options = {
    body: event.data ? event.data.text() : "你有新的提醒！",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-72x72.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: "explore",
        title: "查看作品",
        icon: "/icons/icon-72x72.png",
      },
      {
        action: "close",
        title: "關閉",
        icon: "/icons/icon-72x72.png",
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification("WatchedIt 提醒", options)
  );
});

// 處理通知點擊
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "explore") {
    event.waitUntil(clients.openWindow("/"));
  }
});

// 背景同步功能
async function doBackgroundSync() {
  try {
    // 這裡可以實現離線數據同步
    console.log("Background sync completed");
  } catch (error) {
    console.error("Background sync failed:", error);
  }
}
