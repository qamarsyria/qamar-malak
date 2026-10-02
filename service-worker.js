/* ============================================================
   Service Worker — ملاك المعرفة
   النسخة 3 — تحل مشاكل cache القديمة
   - يحذف bot.html و ibn-qayyim.html من الكاش
   - يضيف masael.html و library.html
   - لا يتدخل في ملفات الصوت (everyayah / islamcan / archive)
   ============================================================ */

const CACHE_NAME = 'malak-almarifa-v3';
const RUNTIME_CACHE = 'malak-runtime-v3';

// الملفات التي تُخزَّن مسبقًا عند التثبيت
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
    './prayer.html',
    './tasbih.html',
    './calendar.html',
    './search.html',
    './masael.html',
    './library.html',
    './faq-data.js',
    './hadith-db.js',
    './manifest.json'
];

// النطاقات الخارجية المسموح بتخزينها مؤقتًا (runtime)
const ALLOWED_RUNTIME_HOSTS = [
    'api.alquran.cloud',
    'api.aladhan.com',
    'fonts.googleapis.com',
    'fonts.gstatic.com'
];

// النطاقات التي يجب ألا يتدخل فيها SW إطلاقًا (صوت)
const BYPASS_HOSTS = [
    'everyayah.com',
    'islamcan.com',
    'cdn.islamcan.com',
    'archive.org',
    'ia800307.us.archive.org'
];

// ============================================================
// التثبيت: تخزين الملفات الأساسية
// ============================================================
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return Promise.all(
                STATIC_ASSETS.map(url =>
                    cache.add(url).catch(err => {
                        console.log('[SW] تخطي:', url, err.message);
                    })
                )
            );
        }).then(() => self.skipWaiting())
    );
});

// ============================================================
// التنشيط: حذف كل الكاش القديم
// ============================================================
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter(k => k !== CACHE_NAME && k !== RUNTIME_CACHE)
                    .map(k => {
                        console.log('[SW] حذف الكاش القديم:', k);
                        return caches.delete(k);
                    })
            );
        }).then(() => self.clients.claim())
        .then(() => {
            // إبلاغ كل التبويبات المفتوحة بإعادة التحميل
            return self.clients.matchAll({ type: 'window' });
        }).then((clients) => {
            clients.forEach(client => {
                if (client.url && 'navigate' in client) {
                    // لا نجبر التحديث، فقط نبلّغ
                    client.postMessage({ type: 'SW_UPDATED', version: CACHE_NAME });
                }
            });
        })
    );
});

// ============================================================
// الاعتراض: إدارة الطلبات
// ============================================================
self.addEventListener('fetch', (event) => {
    const request = event.request;

    // تجاهل الطلبات غير GET
    if (request.method !== 'GET') return;

    const url = new URL(request.url);

    // تجاهل مخططات غير http/https (chrome-extension, etc.)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

    // 1) ملفات الصوت — لا يتدخل SW
    if (BYPASS_HOSTS.some(host => url.hostname.endsWith(host))) {
        return;
    }

    // 2) الطلبات الداخلية (نفس النطاق)
    if (url.origin === self.location.origin) {
        event.respondWith(handleLocalRequest(request));
        return;
    }

    // 3) الطلبات الخارجية المسموح بها
    if (ALLOWED_RUNTIME_HOSTS.some(host => url.hostname.endsWith(host))) {
        event.respondWith(handleRuntimeRequest(request));
        return;
    }

    // 4) باقي الطلبات: لا يتدخل SW
});

// ============================================================
// معالج الملفات المحلية: Cache-First مع Network-Fallback
// ============================================================
async function handleLocalRequest(request) {
    // HTML: Network-First (لتحصل على آخر تحديث)
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
            if (offline) return offline;
            return new Response('Offline', { status: 503 });
        }
    }

    // CSS / JS / صور: Cache-First
    const cached = await caches.match(request);
    if (cached) {
        // تحديث في الخلفية (stale-while-revalidate)
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
        if (offline) return offline;
        return new Response('Not found', { status: 404 });
    }
}

// ============================================================
// معالج الطلبات الخارجية: Network-First مع Cache-Fallback
// ============================================================
async function handleRuntimeRequest(request) {
    const cached = await caches.match(request);
    if (cached) {
        // حدّث في الخلفية
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

// ============================================================
// استقبال رسائل من الصفحات (تحديث قسري)
// ============================================================
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        caches.keys().then(keys => {
            return Promise.all(keys.map(k => caches.delete(k)));
        }).then(() => {
            if (event.source && event.source.postMessage) {
                event.source.postMessage({ type: 'CACHE_CLEARED' });
            }
        });
    }
});
