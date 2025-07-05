// Service Worker for caching and performance optimization
const CACHE_NAME = 'blog-cache-v1';
const urlsToCache = [
	'/blog/',
	'/blog/favicon.svg',
	'/blog/og-image.svg',
	'/blog/site.webmanifest',
	'/blog/offline.html',
];

// Install event - cache resources
self.addEventListener('install', (event) => {
	event.waitUntil(
		caches
			.open(CACHE_NAME)
			.then((cache) => cache.addAll(urlsToCache))
			.then(() => self.skipWaiting()),
	);
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((cacheNames) => {
				return Promise.all(
					cacheNames
						.filter((cacheName) => cacheName !== CACHE_NAME)
						.map((cacheName) => caches.delete(cacheName)),
				);
			})
			.then(() => self.clients.claim()),
	);
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
	// Skip non-GET requests
	if (event.request.method !== 'GET') return;

	// Skip external requests
	if (!event.request.url.startsWith(self.location.origin)) return;

	event.respondWith(
		caches
			.match(event.request)
			.then((response) => {
				// Cache hit - return response
				if (response) {
					return response;
				}

				// Clone the request
				const fetchRequest = event.request.clone();

				return fetch(fetchRequest).then((response) => {
					// Check if valid response
					if (!response || response.status !== 200 || response.type !== 'basic') {
						return response;
					}

					// Clone the response
					const responseToCache = response.clone();

					// Cache CSS, JS, and image files
					if (event.request.url.match(/\.(css|js|svg|png|jpg|jpeg|webp|woff2?)$/)) {
						caches.open(CACHE_NAME).then((cache) => {
							cache.put(event.request, responseToCache);
						});
					}

					return response;
				});
			})
			.catch(() => {
				// Offline fallback for HTML pages
				const acceptHeader = event.request.headers.get('accept');
				if (acceptHeader?.includes('text/html')) {
					return caches.match('/blog/offline.html');
				}
			}),
	);
});
