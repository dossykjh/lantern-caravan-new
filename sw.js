// The game's service worker: with it Android installs the game as a full app (no Chrome badge on the icon), and it
// opens without a network. Network first, so a new version is always picked up; the last good copy of each file is
// kept for when there is no network. (Sound comes in ranges, which aren't kept: it plays when online.)
const CACHE = 'lantern-caravan';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res.status === 200 && !req.headers.has('range')) {
          const copy = res.clone();
          e.waitUntil(caches.open(CACHE).then((c) => c.put(req, copy)));
        }
        return res;
      })
      .catch(() => caches.match(req, { ignoreSearch: true }).then((hit) => hit ?? Response.error())),
  );
});
