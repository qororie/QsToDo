// =============================================
// Service Worker
// キャッシュの名前（バージョンを変えると古いキャッシュが消える）
// ファイルを更新したときは todo-cache-v1をv2, v3 と数字を上げて書き換える
// =============================================
const CACHE_NAME = 'todo-cache-v3'

// キャッシュするファイルの一覧
const FILES_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
]

// ── インストール時（最初の1回だけ実行） ──
// アプリに必要なファイルをキャッシュに保存する
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE)
    })
  )
  // 新しいService Workerをすぐに有効にする
  self.skipWaiting()
})

// ── アクティベート時（新バージョンに切り替わるとき） ──
// 古いキャッシュを削除する
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(
        keyList.map(key => {
          // 今のキャッシュ名と違うものは古いので削除する
          if (key !== CACHE_NAME) {
            return caches.delete(key)
          }
        })
      )
    })
  )
  // すぐに全ページに新しいService Workerを適用する
  self.clients.claim()
})

// ── フェッチ時（ページがファイルを要求するたびに実行） ──
// キャッシュにあればキャッシュから、なければネットから取得する
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // キャッシュにあればそれを返す
      if (response) return response
      // キャッシュにないときはネットから取得する
      return fetch(event.request)
    })
  )
})

// 新しいService Workerがあるとき自動でページを更新する
self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') self.skipWaiting()
})