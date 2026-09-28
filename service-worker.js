const CACHE_NAME = 'qamar-malak-v1';
const STATIC_ASSETS = [
  './',
  './index.html',
  './style.css',
  './offline.html',
  './quran.html',
  './surah.html',
  './tafsir.html',
  './hadith.html',
  './seerah.html',
  './ghazawat.html',
  './prophets.html',
  './quranic-stories.html',
  './sahaba.html',
  './shuhada.html',
  './adhkar.html',
  './fiqh.html',
  './zuhd.html',
  './fadail.html',
  './sihr.html',
  './search.html',
  './manifest.json'
];

// تثبيت Service Worker - تخزين كل الملفات
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(
        STATIC_ASSETS.map(url => 
          cache.add(url).catch(err => console.log('Cache miss:', url))
        )
      );
    }).then(() => self.skipWaiting())
  );
});

// تنشيط Service Worker - حذف الكاش القديم
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// معالجة الطلبات
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // صفحات الموقع الثابتة: Cache First (تعمل بدون نت)
  if (url.origin === location.origin) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((resp) => {
          const copy = resp.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, copy));
          return resp;
        }).catch(() => caches.match('./offline.html'));
      })
    );
    return;
  }

  // المحتوى الخارجي (API): Network First مع كاش احتياطي
  event.respondWith(
    fetch(event.request).then((resp) => {
      const copy = resp.clone();
      caches.open(CACHE_NAME).then(c => c.put(event.request, copy));
      return resp;
    }).catch(() => caches.match(event.request))
  );
});
