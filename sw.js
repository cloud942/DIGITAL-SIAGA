/* Digital SIAGA - Service Worker
   Ganti versi CACHE setiap kali update index.html agar cache lama tergantikan. */
const CACHE = 'digital-siaga-v1';

const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './logo.png',
  './logo-192.png',
  './logo-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.3.0/exceljs.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'
];

// Pasang: cache seluruh app shell (abaikan file yang gagal agar instalasi tetap sukses)
self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(c){
      return Promise.all(ASSETS.map(function(url){
        return c.add(url).catch(function(err){ console.warn('SW skip cache:', url, err); });
      }));
    }).then(function(){ return self.skipWaiting(); })
  );
});

// Aktif: hapus cache versi lama
self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){ if(k!==CACHE) return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

// Ambil: cache-first (cepat & jalan offline), lalu perbarui cache dari jaringan bila ada
self.addEventListener('fetch', function(e){
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(function(cached){
      var network = fetch(e.request).then(function(res){
        if (res && res.status===200 && (res.type==='basic' || res.type==='cors')) {
          var copy = res.clone();
          caches.open(CACHE).then(function(c){ c.put(e.request, copy); });
        }
        return res;
      }).catch(function(){ return cached; });
      return cached || network;
    })
  );
});
