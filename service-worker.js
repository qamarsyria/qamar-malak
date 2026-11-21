/* ============================================================
   Service Worker — ملاك المعرفة (v4)
   تحديث كامل: دعم المكتبة الداخلية والقراءة بدون إنترنت
   ============================================================ */

const CACHE_NAME = 'malak-almarifa-v4';
const RUNTIME_CACHE = 'malak-runtime-v4';

const STATIC_ASSETS = [
    './',
    './index.html',
    './style.css',
    './layout.js',
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
    './prayer.html',
    './tasbih.html',
    './calendar.html',
    './search.html',
    './masael.html',
    './women.html',
    './library.html',
    './book-reader.html',
    './data/books/catalog.js',
    './data/books/usul-thalathah.js',
    './data/books/qawaid-arbaa.js',
    './faq-data.js',
    './hadith-db.js',
    './manifest.json'
];

const ALLOWED_RUNTIME_HOSTS = [
    'api.alquran.cloud',
    'api.aladhan.com',
    'fonts.googleapis.com',
    'fonts.gstatic.com'
];

const BYPASS_HOSTS = [
    'everyayah.com',
    'islamcan.com',
    'cdn.islamcan.com',
    'archive.org',
    'ia800307.us.archive.org'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return Promise.all(
                STATIC_ASSETS.map(url =>
                    cache.add(url).catch(() => {})
                )
            );
        }).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter(k => k !== CACHE_NAME && k !== RUNTIME_CACHE)
                    .map(k => caches.delete(k))
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const request = event.request;
    if (request.method !== 'GET') return;

    const url = new URL(request.url);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

    if (BYPASS_HOSTS.some(host => url.hostname.endsWith(host))) {
        return;
    }

    if (url.origin === self.location.origin) {
        event.respondWith(handleLocalRequest(request));
        return;
    }

    if (ALLOWED_RUNTIME_HOSTS.some(host => url.hostname.endsWith(host))) {
        event.respondWith(handleRuntimeRequest(request));
    }
});

async function handleLocalRequest(request) {
    const isHTML = request.headers.get('accept')?.includes('text/html') ||
                   request.url.endsWith('.html') ||
                   request.url.endsWith('/');

    if (isHTML) {
        try {
            const response = await fetch(request);
            if (response && response.ok) {
                const cache = await caches.open(CACHE_NAME);
                cache.put(request, response.clone());
            }
            return response;
        } catch (err) {
            const cached = await caches.match(request);
            if (cached) return cached;
            const offline = await caches.match('./offline.html');
            return offline || new Response('Offline', { status: 503 });
        }
    }

    const cached = await caches.match(request);
    if (cached) {
        fetch(request).then(response => {
            if (response && response.ok) {
                caches.open(CACHE_NAME).then(cache => cache.put(request, response));
            }
        }).catch(() => {});
        return cached;
    }

    try {
        const response = await fetch(request);
        if (response && response.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, response.clone());
        }
        return response;
    } catch (err) {
        const offline = await caches.match('./offline.html');
        return offline || new Response('Not found', { status: 404 });
    }
}

async function handleRuntimeRequest(request) {
    const cached = await caches.match(request);
    if (cached) {
        fetch(request).then(response => {
            if (response && response.ok) {
                caches.open(RUNTIME_CACHE).then(cache => cache.put(request, response));
            }
        }).catch(() => {});
        return cached;
    }

    try {
        const response = await fetch(request);
        if (response && response.ok) {
            const cache = await caches.open(RUNTIME_CACHE);
            cache.put(request, response.clone());
        }
        return response;
    } catch (err) {
        return new Response(JSON.stringify({ error: 'offline' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))));
    }
});
