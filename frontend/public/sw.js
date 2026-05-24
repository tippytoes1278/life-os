const CACHE = 'life-os-v1'

// On install: cache the app shell
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(['/', '/index.html']))
  )
  self.skipWaiting()
})

// On activate: purge old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// Fetch strategy:
// - API / Supabase / Cloudinary → always network (never cache)
// - Static assets (JS/CSS/fonts/images) → cache-first, update in background
// - HTML navigation → network-first, fall back to cached shell
self.addEventListener('fetch', (e) => {
  const url = e.request.url

  // Skip non-GET and third-party API calls
  if (e.request.method !== 'GET') return
  if (url.includes('/api/') || url.includes('supabase.co') ||
      url.includes('cloudinary.com') || url.includes('anthropic') ||
      url.includes('twilio')) return

  // Static assets — cache first
  if (url.match(/\.(js|css|woff2?|png|svg|ico|webp|jpg|jpeg)(\?|$)/)) {
    e.respondWith(
      caches.match(e.request).then((cached) => {
        const network = fetch(e.request).then((res) => {
          if (res.ok) caches.open(CACHE).then((c) => c.put(e.request, res.clone()))
          return res
        })
        return cached || network
      })
    )
    return
  }

  // HTML / navigation — network first, fall back to cached /index.html
  if (e.request.mode === 'navigate' || e.request.headers.get('accept')?.includes('text/html')) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match('/index.html'))
    )
    return
  }
})
