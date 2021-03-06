'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "assets/AssetManifest.json": "b7097a79ed0de87b3e8691d17c2a3288",
"assets/assets/audio/blipp.mp3": "e16e087215b6c28ac705245108cb5f39",
"assets/assets/audio/harp.mp3": "8dca853cd507864bf21eda05d3ef36ce",
"assets/assets/audio/kliiing.mp3": "9fb403f6d2fe7cd6fb2c8f6f35d838d3",
"assets/assets/audio/light_pling.mp3": "f2be6e17211692e5c1f8d60eeeeb0e44",
"assets/assets/audio/pling.mp3": "82b4832707a8b11291eb86046a056718",
"assets/assets/audio/thud.mp3": "3584765a7ffa9f4498e74a0470453387",
"assets/assets/blipp.mp3": "e16e087215b6c28ac705245108cb5f39",
"assets/assets/images/1.jpg": "7421347a8b7a18eba3d104f7bc68b757",
"assets/assets/images/2.jpg": "ca2543cf6f65d0a94f90de932f53d891",
"assets/assets/images/3.jpg": "81ff0aba33134474ed80170749ad70b8",
"assets/assets/images/4.jpg": "b32f838e7920ad14518e5d4e1afcf722",
"assets/assets/images/5.jpg": "0509929c8170e196fc265cc51b179ec3",
"assets/assets/images/6.jpg": "a1a14eea0b1fe3b1779943d43a22f06e",
"assets/assets/images/arrowBottom.jpg": "083d5770d9b941c6ed84be8bb61b807b",
"assets/assets/images/arrowBottom.png": "3c251d9063321b63b3e447d207f750c9",
"assets/assets/images/arrowLeft.jpg": "8bea1fa50686fd3a758f1bb62864746e",
"assets/assets/images/arrowLeft.png": "ba6507d628d890b8aaa407e86444d60b",
"assets/assets/images/arrowRight.png": "c7a5719b58c27fb32405bbf42d41b201",
"assets/assets/images/arrowRightOld.jpg": "138346d5d6224a6437ad8bf5e9ba3e51",
"assets/assets/images/arrowTop.jpg": "0c2b1465a91575c626661241bc20d4fe",
"assets/assets/images/arrowTop.png": "3c6f6d6e328741c9ae945e680679e9e2",
"assets/assets/images/background.jpg": "3d88f6382a18e1b877901ed0575b2600",
"assets/assets/images/empty.jpg": "e5ac068b9d05e367fb8458efbb32698a",
"assets/assets/images/flutter_logo.png": "cc8878834b02681c9915c7c7e8eeb00f",
"assets/assets/images/hold.jpg": "3bd7808f169d97f1e42f9c1ccb726518",
"assets/assets/images/img1.jpg": "f9af004239424c89617f8fb410d5d750",
"assets/assets/images/img2.jpg": "a57f6ab554d9fcdaa7e108be7b960bf3",
"assets/assets/images/img3.jpg": "574baa69808effa5022f1dcc6561cf40",
"assets/assets/images/neutral.jpg": "0b84fd5f50415582766ac700f346f5a9",
"assets/assets/images/Prevas.png": "332dee3ac1d956e13891b506838f80c2",
"assets/assets/images/prevas_logo_2019.jpg": "6de69dfd21cc921c7949bcfcbe3cc7fb",
"assets/assets/images/roll.jpg": "20cb0a676bbb89954bfcf88c7b333d8f",
"assets/assets/images/terass.jpg": "f4a4860cd0b558a36b6888da16b219fc",
"assets/assets/images/yatzy_landscape.jpg": "66a22ddaaf89276410edbff567eb456f",
"assets/assets/images/yatzy_landscape2.jpg": "ec1590b5d6fe6dff4c91c4081615ffdd",
"assets/assets/images/yatzy_portrait.jpg": "abae29668ba79493fe6782ff9cd016ae",
"assets/FontManifest.json": "dc3d03800ccca4601324923c0b1d6d57",
"assets/fonts/MaterialIcons-Regular.otf": "95db9098c58fd6db106f1116bae85a0b",
"assets/NOTICES": "22f600abba2dde55777e5cf7697e1e51",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"canvaskit/canvaskit.js": "c2b4e5f3d7a3d82aed024e7249a78487",
"canvaskit/canvaskit.wasm": "4b83d89d9fecbea8ca46f2f760c5a9ba",
"canvaskit/profiling/canvaskit.js": "ae2949af4efc61d28a4a80fffa1db900",
"canvaskit/profiling/canvaskit.wasm": "95e736ab31147d1b2c7b25f11d4c32cd",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"flutter.js": "eb2682e33f25cd8f1fc59011497c35f8",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"icons/Icon-maskable-192.png": "c457ef57daa1d16f64b27b786ec2ea3c",
"icons/Icon-maskable-512.png": "301a7604d45b3e739efc881eb04896ea",
"index.html": "d4be2f52a28840c020e7f21394738541",
"/": "79c7b3212dce1b4f11b04d772fa66bb6",
"main.dart.js": "1403dcbd173c43dc52412873ec8ce6a5",
"manifest.json": "3c9c0a4c1427016b6e684093bc2b47f7",
"UnityLibrary/Build/UnityLibrary.data": "ec14cba97d7dedd37674b930d0d906de",
"UnityLibrary/Build/UnityLibrary.framework.js": "bcf1838218c6f1a7a536a106ef126902",
"UnityLibrary/Build/UnityLibrary.loader.js": "fb71d028619e714657010c1a83ad1355",
"UnityLibrary/Build/UnityLibrary.wasm": "6a5d3986f55f29ccceec0fae063c903e",
"UnityLibrary/index.html": "79c7b3212dce1b4f11b04d772fa66bb6",
"UnityLibrary/StreamingAssets/UnityServicesProjectConfiguration.json": "1ffd80829af0214b859fcb806b282ecd",
"version.json": "f5b2c9e5cf4369be1dec7d3b1a40f7bc"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
