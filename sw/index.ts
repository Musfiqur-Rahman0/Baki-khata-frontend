import "./push";

import {
  APP_ROUTES,
  ASSET_CACHE,
  CORE_ASSETS,
  CACHEABLE_API_PATH,
  PAGE_CACHE,
  PRIVATE_CACHE,
  TRANSACTION_CREATE_PATH,
} from "./config";
import { cacheAuthResponse, getCachedUserId } from "./auth-cache";
import { clearOutboxFailure, getOutbox } from "./outbox";
import { syncOutbox } from "./sync";
import {
  cacheFirst,
  clearPrivateCacheAfterLogout,
  networkFirstApi,
  networkFirstPage,
  queueTransactionWhenOffline,
} from "./strategies";

declare const self: ServiceWorkerGlobalScope;

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const assets = await caches.open(ASSET_CACHE);
      await assets.addAll(CORE_ASSETS);
      const pages = await caches.open(PAGE_CACHE);
      await Promise.all(
        APP_ROUTES.map(async (path) => {
          try {
            const response = await fetch(path);
            if (response.ok && !response.redirected) {
              await pages.put(path, response);
            }
          } catch (error) {
            console.warn("Could not precache app route:", path, error);
          }
        }),
      );
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const current = [ASSET_CACHE, PAGE_CACHE, PRIVATE_CACHE];
      const names = await caches.keys();
      // Delete old versioned caches that are no longer in use
      await Promise.all(
        names
          .filter(
            (name) => name.startsWith("baki-khata-") && !current.includes(name),
          )
          .map((name) => caches.delete(name)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("message", (event) => {
  const message = event.data;
  if (message?.type === "SYNC_OUTBOX") {
    event.waitUntil(syncOutbox());
    return;
  }
  if (message?.type === "CLEAR_PRIVATE_DATA") {
    event.waitUntil(caches.delete(PRIVATE_CACHE));
    return;
  }
  if (message?.type === "CACHE_AUTH_USER") {
    event.waitUntil(
      cacheAuthResponse(
        new Response(
          JSON.stringify({ success: true, data: { user: message.user } }),
          { headers: { "Content-Type": "application/json" } },
        ),
      ),
    );
    return;
  }
  if (message?.type === "RETRY_TRANSACTION") {
    event.waitUntil(
      (async () => {
        await clearOutboxFailure(message.requestId);
        await syncOutbox();
      })(),
    );
    return;
  }
  if (message?.type === "GET_PENDING_TRANSACTIONS") {
    event.waitUntil(
      (async () => {
        const userId = await getCachedUserId();
        const records = userId ? await getOutbox() : [];
        event.ports[0]?.postMessage(
          records
            .filter((record) => record.userId === userId)
            .map((record) => ({
              ...record.transaction,
              ...(record.failed ? { syncError: record.failed } : {}),
            })),
        );
      })(),
    );
  }
});

// "sync" isn't in the default WebWorker typings, so the event is typed loosely
self.addEventListener("sync", (event: any) => {
  if (event.tag === "sync-transactions") {
    event.waitUntil(syncOutbox());
  }
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.method === "POST" && TRANSACTION_CREATE_PATH.test(url.pathname)) {
    event.respondWith(queueTransactionWhenOffline(request));
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/v1/auth/logout") {
    event.respondWith(clearPrivateCacheAfterLogout(request));
    return;
  }

  if (request.method !== "GET") return;

  if (CACHEABLE_API_PATH.test(url.pathname)) {
    event.respondWith(networkFirstApi(request));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirstPage(request));
    return;
  }

  if (
    url.pathname.startsWith("/_next/static/") ||
    CORE_ASSETS.includes(url.pathname)
  ) {
    event.respondWith(cacheFirst(request));
  }
});
