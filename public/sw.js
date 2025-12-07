// 점AI Service Worker - 오프라인 지원 및 캐싱
const CACHE_NAME = 'jeom-ai-v1';
const STATIC_CACHE = 'jeom-ai-static-v1';

// 정적 자산 캐싱
const STATIC_ASSETS = [
    '/',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png'
];

// 캐시할 API 패턴
const CACHE_PATTERNS = [
    /fonts\.googleapis\.com/,
    /fonts\.gstatic\.com/,
    /cdn\.jsdelivr\.net/
];

// 설치 이벤트
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())
            .catch(err => console.log('Cache install failed:', err))
    );
});

// 활성화 이벤트 - 이전 캐시 정리
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME && key !== STATIC_CACHE)
                    .map(key => caches.delete(key))
            ))
            .then(() => self.clients.claim())
    );
});

// 페치 이벤트 - 캐시 우선 전략
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Firebase/API 요청은 네트워크 우선
    if (url.hostname.includes('firebase') ||
        url.hostname.includes('anthropic') ||
        url.hostname.includes('googleapis')) {
        event.respondWith(networkFirst(request));
        return;
    }

    // 정적 자산은 캐시 우선
    if (request.destination === 'image' ||
        request.destination === 'font' ||
        CACHE_PATTERNS.some(pattern => pattern.test(url.href))) {
        event.respondWith(cacheFirst(request));
        return;
    }

    // HTML 요청은 네트워크 우선 (SPA)
    if (request.mode === 'navigate') {
        event.respondWith(networkFirst(request));
        return;
    }

    // 기타는 stale-while-revalidate
    event.respondWith(staleWhileRevalidate(request));
});

// 캐시 우선 전략
async function cacheFirst(request) {
    const cached = await caches.match(request);
    if (cached) return cached;

    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, response.clone());
        }
        return response;
    } catch (err) {
        return new Response('Offline', { status: 503 });
    }
}

// 네트워크 우선 전략
async function networkFirst(request) {
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, response.clone());
        }
        return response;
    } catch (err) {
        const cached = await caches.match(request);
        if (cached) return cached;

        // 오프라인 폴백 (HTML 요청인 경우)
        if (request.mode === 'navigate') {
            return caches.match('/');
        }
        return new Response('Offline', { status: 503 });
    }
}

// Stale-while-revalidate 전략
async function staleWhileRevalidate(request) {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);

    const fetchPromise = fetch(request).then(response => {
        if (response.ok) {
            cache.put(request, response.clone());
        }
        return response;
    }).catch(() => cached);

    return cached || fetchPromise;
}

// 푸시 알림 (향후 확장)
self.addEventListener('push', (event) => {
    if (!event.data) return;

    const data = event.data.json();
    const options = {
        body: data.body || '새로운 알림이 있습니다',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        vibrate: [100, 50, 100],
        data: { url: data.url || '/' }
    };

    event.waitUntil(
        self.registration.showNotification(data.title || '점AI', options)
    );
});

// 알림 클릭
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const url = event.notification.data?.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window' })
            .then(windowClients => {
                for (const client of windowClients) {
                    if (client.url === url && 'focus' in client) {
                        return client.focus();
                    }
                }
                return clients.openWindow(url);
            })
    );
});
