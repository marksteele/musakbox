if (typeof importScripts === 'function') {
  importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.0.0/workbox-sw.js');
  /* global workbox */
  if (workbox) {

    const handleSong = async ({url, event}) => {
      const cache = await caches.open('musakbox');
      const matches = url.href.match(/.*\/(songs\/.+?\.(mp3|flac|wav|ogg)).*/i);
      const cacheReq = new Request(matches[1]);
      console.log("Checking cache for " + matches[1]);
      const cacheResponse = await cache.match(cacheReq);
      if (cacheResponse) {
        console.log("SW: AUTOCACHE: CACHE HIT: " + matches[1]);
        return cacheResponse;
      }
      console.log("SW: AUTOCACHE: CACHE MISS: " + matches[1]);
      const response = await fetch(url.href);
      if (response.ok) {
        await cache.put(cacheReq, response.clone());
      } else {
        console.log("SW: AUTOCACHE: ERROR FETCHING: " + matches[1]);
      }
      return response;
    };

    console.log('Workbox is loaded');
    workbox.core.skipWaiting();
    /* injection point for manifest files.  */
    workbox.precaching.precacheAndRoute(self.__WB_MANIFEST);

    workbox.routing.registerRoute(
      /.*\/(songs\/.+?\.(mp3|flac|wav|ogg)).*/i,
      handleSong
    );
    
    
    workbox.routing.registerRoute(
      new RegExp('.*'),
      new workbox.strategies.CacheFirst({cacheName: 'musakbox'})
    );
  } else {
    console.log('Workbox could not be loaded. No Offline support');
  }
}
// ServiceWorker can receive messages to cache things...
self.addEventListener('message', function(event) {
  var p = caches.open('musakbox').then(function(cache) {
    switch (event.data.command) {
      case 'del':
        return cache.delete(new Request(event.data.url));
      case 'flush':
        return cache.keys().then(reqs => Promise.all(reqs.map(req => cache.delete(req))));
      case 'flushMeta':
        return cache.keys().then(reqs => Promise.all(reqs.filter(req => {
          return /\?prefix=private%2F/.test(req.url)
        }).map(req => cache.delete(req))));
      case 'add':
        const matches = event.data.url.match(/.*\/(songs\/.+?\.(mp3|flac|wav|ogg))\?.*/i);
        const cacheReq = new Request(matches[1]);
        return cache.match(cacheReq).then(res => {
          if (res) {
            console.log("SW: PRECACHE: CACHE HIT - PREFETCHER: " + matches[1]);
            return res;
          }
          console.log("SW: PRECACHE: CACHE MISS - PREFETCHER - FETCHING: " + matches[1]);
          return fetch(event.data.url)
            .then(response => {
              if (response.ok) {
                cache.put(matches[1], response)
              } else {
                console.log("SW: PRECACHE: NOT OK RESPONSE: " + matches[1]);
              }
              return response;
            });
        })
      default:
        // This will be handled by the outer .catch().
        throw Error('Unknown command: ' + event.data.command);
    }
  }).catch(function(error) {
    // If the promise rejects, handle it by returning a standardized error message to the controlled page.
    console.error('Message handling failed:', error);
  });

  // Beginning in Chrome 51, event is an ExtendableMessageEvent, which supports
  // the waitUntil() method for extending the lifetime of the event handler
  // until the promise is resolved.
  if ('waitUntil' in event) {
    event.waitUntil(p);
  }

  // Without support for waitUntil(), there's a chance that if the promise chain
  // takes "too long" to execute, the service worker might be automatically
  // stopped before it's complete.
});