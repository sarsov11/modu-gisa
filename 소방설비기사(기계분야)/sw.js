/* 모두의 소방기계 — 오프라인 캐시.
   틀(HTML·CSS)은 새것을 먼저 보고, 자료(js)는 캐시를 먼저 준 뒤 뒤에서 갱신한다.
   문항 그림은 미리 받지 않고 본 것만 남긴다(1,600장을 통째로 받으면 안 된다). */
var VER = "terra-v3";   // 루틴·알림이 들어가 캐시를 새로 판다
var SHELL = [
  "./", "./index.html", "./skilltree.html", "./study.html",
  "./settings.html", "./css/base.css",
  "./js/data.js", "./js/app.js", "./js/notify.js",
  "./manifest.webmanifest", "./icons/icon-192.png"
];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(VER).then(function (c) {
    return c.addAll(SHELL).catch(function () { /* 하나 빠져도 설치는 계속 */ });
  }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== VER; })
      .map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);
  if (url.origin !== location.origin) return;

  var isDoc = req.mode === "navigate" || /\.html$/.test(url.pathname);
  var isBig = /\.(js|css)$/.test(url.pathname);
  var isImg = /\/img\//.test(url.pathname);

  if (isDoc) {                       // 화면은 새것 먼저
    e.respondWith(fetch(req).then(function (r) {
      var cp = r.clone();
      caches.open(VER).then(function (c) { c.put(req, cp); });
      return r;
    }).catch(function () { return caches.match(req); }));
    return;
  }
  if (isBig || isImg) {              // 자료·그림은 캐시 먼저, 뒤에서 갱신
    e.respondWith(caches.match(req).then(function (hit) {
      var net = fetch(req).then(function (r) {
        var cp = r.clone();
        caches.open(VER).then(function (c) { c.put(req, cp); });
        return r;
      }).catch(function () { return hit; });
      return hit || net;
    }));
  }
});

/* ── 알림 ────────────────────────────────────────
   앱이 닫혀 있어도 하루 한 번 깨워 달라고 브라우저에 부탁해 둔 것(periodicSync).
   Chrome/Android 에 설치돼 있고 자주 쓰는 앱일 때만 브라우저가 허락한다.
   울릴 문구는 창(js/notify.js)이 계산하지만, 창이 없으면 여기서 기본 문구를 쓴다. */
self.addEventListener("periodicsync", function (e) {
  if (e.tag !== "terra-daily") return;
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true })
    .then(function (cs) {
      if (cs.length) { cs[0].postMessage({ t: "terra-daily" }); return; }  // 창이 있으면 창이 띄운다
      return self.registration.showNotification("모두의 통사 · 오늘 15분", {
        body: "짧게 한 번 하고 갈까요?",
        icon: "./icons/icon-192.png", badge: "./icons/icon-192.png",
        tag: "terra-daily", data: { url: "./index.html" }
      });
    }));
});

self.addEventListener("notificationclick", function (e) {
  e.notification.close();
  var url = (e.notification.data && e.notification.data.url) || "./index.html";
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true })
    .then(function (cs) {
      for (var i = 0; i < cs.length; i++)
        if ("focus" in cs[i]) return cs[i].focus();
      return self.clients.openWindow(url);
    }));
});
