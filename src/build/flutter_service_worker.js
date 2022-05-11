'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "assets/AssetManifest.json": "c8627b581b5b78cd6f020b77740b701f",
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
"assets/assets/images/background.jpg": "3d88f6382a18e1b877901ed0575b2600",
"assets/assets/images/empty.jpg": "e5ac068b9d05e367fb8458efbb32698a",
"assets/assets/images/flutter_logo.png": "cc8878834b02681c9915c7c7e8eeb00f",
"assets/assets/images/hold.jpg": "3bd7808f169d97f1e42f9c1ccb726518",
"assets/assets/images/img1.jpg": "f9af004239424c89617f8fb410d5d750",
"assets/assets/images/img2.jpg": "a57f6ab554d9fcdaa7e108be7b960bf3",
"assets/assets/images/img3.jpg": "574baa69808effa5022f1dcc6561cf40",
"assets/assets/images/neutral.jpg": "0b84fd5f50415582766ac700f346f5a9",
"assets/assets/images/roll.jpg": "20cb0a676bbb89954bfcf88c7b333d8f",
"assets/assets/images/yatzy_landscape.jpg": "66a22ddaaf89276410edbff567eb456f",
"assets/assets/images/yatzy_landscape2.jpg": "ec1590b5d6fe6dff4c91c4081615ffdd",
"assets/assets/images/yatzy_portrait.jpg": "abae29668ba79493fe6782ff9cd016ae",
"assets/FontManifest.json": "dc3d03800ccca4601324923c0b1d6d57",
"assets/fonts/MaterialIcons-Regular.otf": "7e7a6cccddf6d7b20012a548461d5d81",
"assets/NOTICES": "5713657a5896b4e4e8ab393c9b062073",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"icons/Icon-maskable-192.png": "c457ef57daa1d16f64b27b786ec2ea3c",
"icons/Icon-maskable-512.png": "301a7604d45b3e739efc881eb04896ea",
"index.html": "c5b6c4b7b8902a870ae5b6748cb2d086",
"/": "be6e927603eb7808cb47503ab9bea15b",
"main.dart.js": "b7e7996b4fae2a542b3e1523f753e466",
"manifest.json": "4d3c7a6273d2c1c28562878f9cf047c8",
"UnityLibrary/Build/UnityLibrary.data": "5514e2dc73e6ac4150134274589eb82e",
"UnityLibrary/Build/UnityLibrary.framework.js": "e2836d20dc7a005c27b061f72cd918d7",
"UnityLibrary/Build/UnityLibrary.loader.js": "a4d9b439a7bfef173a7a1f85297e11c0",
"UnityLibrary/Build/UnityLibrary.wasm": "c568938f1e307c372e728db6236bb180",
"UnityLibrary/index.html": "be6e927603eb7808cb47503ab9bea15b",
"version.json": "6e219987ebc110d8f6d87e34448379f6"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
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
