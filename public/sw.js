// 轻量离线缓存：安装时预缓存首页，激活时清理旧缓存，离线回退读取缓存。
const CACHE_NAME = "learnflow-starter-v1";
const OFFLINE_URLS = ["/"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      // 预缓存核心页面资源，支持离线访问。
      .then((cache) => cache.addAll(OFFLINE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        // 移除旧版本缓存，避免占用空间。
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  // 立即接管页面，避免等待刷新。
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // 仅处理 GET 请求，其他请求交给浏览器。
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    // 网络优先，失败时回退到缓存。
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
