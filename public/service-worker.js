/**
 * Welcome to your Workbox-powered service worker!
 *
 * You'll need to register this file in your web app and you should
 * disable HTTP caching for this file too.
 * See https://goo.gl/nhQhGp
 *
 * The rest of the code is auto-generated. Please don't update this file
 * directly; instead, make changes to your Workbox build configuration
 * and re-run your build process.
 * See https://goo.gl/2aRDsh
 */

 importScripts("https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

 importScripts(
   "/precache-manifest.42eaa1d67bcc35eee4e1620e31803da3.js"
 );
 
 var cacheName = 'sectio-canonis-v1.0.0';
 
 self.addEventListener('install', function (event) {
   event.waitUntil(
     caches.open(cacheName).then(function (cache) {
       return cache.addAll([
         '/css/',
         '/img/',
         '/js/'
       ]);
     })
   );
 });
 self.addEventListener('message', (event) => {
   if (event.data && event.data.type === 'SKIP_WAITING') {
     self.skipWaiting();
   }
 });
 self.addEventListener('fetch', function (event) {
   event.respondWith(
     fetch(event.request).catch(function () {
       return caches.match(event.request);
     })
   );
 });
 self.addEventListener('activate', (e) => {
   e.waitUntil(
     caches.keys().then((keyList) => {
       return Promise.all(keyList.map((key) => {
         if (key !== cacheName) {
           return caches.delete(key);
         }
       }));
     })
   );
 });
 
 /**
  * The workboxSW.precacheAndRoute() method efficiently caches and responds to
  * requests for URLs in the manifest.
  * See https://goo.gl/S9QRab
  */
 self.__precacheManifest = [].concat(self.__precacheManifest || []);
 workbox.precaching.precacheAndRoute(self.__precacheManifest, {});
 