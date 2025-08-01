// Service Worker for PWA
const CACHE_NAME = "watchedit-v1";
const STATIC_CACHE = "watchedit-static-v1";
const DYNAMIC_CACHE = "watchedit-dynamic-v1";

const urlsToCache = [
  "/",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

// 移除硬編碼的路徑前綴
const basePath = "";

// 安裝事件
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log("Opened static cache");
      return cache.addAll(urlsToCache.map((url) => basePath + url));
    })
  );
  self.skipWaiting();
});

// 攔截網路請求
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 只處理同源請求
  if (url.origin !== self.location.origin) {
    return;
  }

  // 靜態資源使用快取優先策略
  if (request.destination === "image" || request.destination === "font") {
    event.respondWith(
      caches.match(request).then((response) => {
        return (
          response ||
          fetch(request).then((fetchResponse) => {
            return caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, fetchResponse.clone());
              return fetchResponse;
            });
          })
        );
      })
    );
    return;
  }

  // 其他請求使用網路優先策略
  event.respondWith(
    fetch(request)
      .then((response) => {
        // 只快取成功的回應
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // 網路失敗時返回快取
        return caches.match(request).then((response) => {
          if (response) {
            return response;
          }
          // 如果沒有快取，返回離線頁面
          if (request.destination === "document") {
            return caches.match(basePath + "/");
          }
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
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log("Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
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
    icon: basePath + "/icons/icon-192x192.png",
    badge: basePath + "/icons/icon-72x72.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: "explore",
        title: "查看作品",
        icon: basePath + "/icons/icon-72x72.png",
      },
      {
        action: "close",
        title: "關閉",
        icon: basePath + "/icons/icon-72x72.png",
      },
    ],
    requireInteraction: true,
    tag: "watchedit-notification",
  };

  event.waitUntil(
    self.registration.showNotification("WatchedIt 提醒", options)
  );
});

// 處理通知點擊
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "explore") {
    event.waitUntil(
      clients.matchAll({ type: "window" }).then((clientList) => {
        // 如果已經有開啟的視窗，聚焦到該視窗
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            return client.focus();
          }
        }
        // 否則開啟新視窗
        if (clients.openWindow) {
          return clients.openWindow(basePath + "/");
        }
      })
    );
  }
});

// 背景同步功能
async function doBackgroundSync() {
  try {
    // 這裡可以實現離線數據同步
    console.log("Background sync completed");

    // 可以添加數據同步邏輯
    // 例如：同步 IndexedDB 數據到雲端
  } catch (error) {
    console.error("Background sync failed:", error);
  }
}

// 處理訊息
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
