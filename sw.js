/* SPOTTER CODE — service worker (v5.0)
   - Guarda o programa (HTML, CSS, JS, ícones) para abrir sem internet.
   - Guarda também as bibliotecas externas (Chart.js, SheetJS, Font Awesome, fontes) na primeira abertura com internet.
   - NUNCA guarda dados do usuário: eles ficam só no localStorage do navegador. */
const VERSION = 'spotter-v6.1.0';
const SHELL = ['./', 'index.html', 'style.css', 'script.js', 'data-incidencia.js', 'data-edital.js', 'data-edital-prf.js', 'data-assets.js', 'supabase-config.js', 'cloud.js', 'manifest.webmanifest',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'icons/apple-touch-icon.png'];
const CDN = [
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js',
  'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&family=UnifrakturCook:wght@700&display=swap'
];
const CDN_HOSTS = ['cdn.jsdelivr.net', 'cdnjs.cloudflare.com', 'fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(VERSION);
    await c.addAll(SHELL);
    // bibliotecas externas: se falhar (sem rede), são guardadas na primeira vez que forem usadas
    await Promise.all(CDN.map(async u => { try { await c.put(u, await fetch(new Request(u, { mode: 'no-cors' }))); } catch (err) { /* tenta depois */ } }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== VERSION) await caches.delete(k);
    await self.clients.claim();
  })());
});

const okResp = r => r && (r.ok || r.type === 'opaque');

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const same = url.origin === self.location.origin;
  if (!same && !CDN_HOSTS.includes(url.hostname)) return;   // qualquer outro site: não mexe
  e.respondWith((async () => {
    const cache = await caches.open(VERSION);
    const hit = await cache.match(req, { ignoreSearch: false }) || (req.mode === 'navigate' ? await cache.match('index.html') : null);
    const net = fetch(same ? new Request(req, { cache: 'no-cache' }) : req).then(r => { if (okResp(r)) cache.put(req, r.clone()); return r; }).catch(() => null);
    if (hit) { e.waitUntil(net); return hit; }          // rápido: usa o guardado e atualiza em segundo plano
    const r = await net;
    return r || new Response('Sem conexão e este arquivo ainda não foi guardado.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  })());
});
