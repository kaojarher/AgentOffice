/* 小蝦辦公室 Service Worker：離線殼層快取 + 通知點擊。更新時請調整 VERSION。 */
const VERSION = "xiaoxia-v6.1.0";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/icon.svg"];
const CDN = ["cdn.jsdelivr.net", "cdnjs.cloudflare.com"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).catch(() => {}));
});
self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== VERSION) await caches.delete(k);
    await self.clients.claim();
  })());
});
self.addEventListener("message", e => { if (e.data === "SKIP_WAITING") self.skipWaiting(); });

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  // 頁面導覽：網路優先（拿到最新版），失敗或逾時改用快取
  if (req.mode === "navigate") {
    e.respondWith((async () => {
      const cache = await caches.open(VERSION);
      try {
        const res = await Promise.race([fetch(req), new Promise((_, no) => setTimeout(() => no(new Error("timeout")), 4000))]);
        if (res && res.ok) cache.put("./index.html", res.clone());
        return res;
      } catch (_) {
        return (await cache.match("./index.html")) || (await cache.match("./")) || Response.error();
      }
    })());
    return;
  }
  // 同源靜態檔：先給快取、背景更新
  if (url.origin === location.origin) {
    e.respondWith((async () => {
      const cache = await caches.open(VERSION);
      const hit = await cache.match(req);
      const net = fetch(req).then(res => { if (res && res.ok) cache.put(req, res.clone()); return res; }).catch(() => null);
      return hit || (await net) || Response.error();
    })());
    return;
  }
  // Word／PDF 解析函式庫（CDN）：用過一次後即可離線
  if (CDN.includes(url.hostname)) {
    e.respondWith((async () => {
      const cache = await caches.open(VERSION);
      const hit = await cache.match(req);
      if (hit) return hit;
      try { const res = await fetch(req); if (res && (res.ok || res.type === "opaque")) cache.put(req, res.clone()); return res; }
      catch (_) { return Response.error(); }
    })());
  }
  // 其他跨網域請求（AI API、MCP、搜尋）一律直連，不快取
});

self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const c of all) { if ("focus" in c) return c.focus(); }
    if (self.clients.openWindow) return self.clients.openWindow("./index.html");
  })());
});
