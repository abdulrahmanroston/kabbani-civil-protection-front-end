// Service Worker - نسخة احترافية نظيفة
const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `civil-defense-${CACHE_VERSION}`;

// الملفات المهمة للـ offline
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/config.js',
  '/api.js',
  '/auth.js',
  '/app.js',
  '/components.js',
  '/utils.js',
  '/style.css'
];

// URLs التي نتجاهل cache لها (API calls)
const API_URLS = [
  '/api/auth',
  '/api/branches',
  '/api/follow-ups',
  '/api/tasks',
  '/api/requireds',
  '/api/upload'
];

// 🔧 Install - تخزين الملفات الأساسية
self.addEventListener('install', (event) => {
  console.log('📦 [SW] Installing Service Worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('✅ [SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting()) // تفعيل فوري
  );
});

// 🔄 Activate - تنظيف الكاش القديم
self.addEventListener('activate', (event) => {
  console.log('🔄 [SW] Activating Service Worker...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(name => name !== CACHE_NAME)
            .map(name => {
              console.log('🗑️ [SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim()) // السيطرة على كل التبويبات
  );
});

// 📡 Fetch - استراتيجية ذكية
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // تجاهل Chrome extensions
  if (!url.protocol.startsWith('http')) return;
  
  // استراتيجية API: Network First (بيانات حديثة دائماً)
  if (isAPIRequest(url)) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }
  
  // استراتيجية Assets: Cache First (سرعة قصوى)
  event.respondWith(cacheFirstStrategy(request));
});

// 🌐 Network First - للـ API
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    // حفظ نسخة في الكاش للـ offline
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // لو النت مقطوع، استخدم الكاش
    console.log('⚠️ [SW] Network failed, trying cache:', request.url);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // لو مافيش كاش، ارجع offline page
    return new Response(
      JSON.stringify({ error: 'لا يوجد اتصال بالإنترنت' }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// 💾 Cache First - للملفات الثابتة
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    // حدّث الكاش في الخلفية
    fetch(request).then(response => {
      if (response.ok) {
        caches.open(CACHE_NAME).then(cache => {
          cache.put(request, response);
        });
      }
    });
    
    return cachedResponse;
  }
  
  // لو مافيش كاش، جيب من النت
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('❌ [SW] Failed to fetch:', request.url);
    throw error;
  }
}

// 🔍 Helper: هل الطلب لـ API؟
function isAPIRequest(url) {
  return API_URLS.some(apiUrl => url.pathname.includes(apiUrl));
}

// 💬 استقبال رسائل من التطبيق
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then(names => {
      names.forEach(name => caches.delete(name));
    });
  }
});
