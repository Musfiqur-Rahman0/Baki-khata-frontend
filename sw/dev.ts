import "./push";
import {
  cacheAuthResponse,
  clearCachedLedgerData,
  getCachedUserId,
} from "./auth-cache";
import {
  CACHEABLE_API_PATH,
  PRIVATE_CACHE,
  TRANSACTION_CREATE_PATH,
} from "./config";
import {
  clearPrivateCacheAfterLogout,
  networkFirstApi,
} from "./strategies";
import { clearOutboxFailure, getOutbox } from "./outbox";
import { syncOutbox } from "./sync";

declare const self: ServiceWorkerGlobalScope;

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("message", (event) => {
  const message = event.data;
  const port = event.ports[0];

  if (message?.type === "GET_PENDING_TRANSACTIONS") {
    event.waitUntil(
      (async () => {
        try {
          const userId = await getCachedUserId();
          const records = userId ? await getOutbox() : [];
          port?.postMessage(
            records
              .filter((record) => record.userId === userId)
              .map((record) => ({
                ...record.transaction,
                ...(record.failed ? { syncError: record.failed } : {}),
              })),
          );
        } catch (error) {
          console.error("Could not read queued transactions:", error);
          port?.postMessage({
            error: "অফলাইন লেনদেনের তালিকা পড়া যায়নি।",
          });
        }
      })(),
    );
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

  if (message?.type === "CLEAR_PRIVATE_DATA") {
    event.waitUntil(caches.delete(PRIVATE_CACHE));
    return;
  }

  if (message?.type === "SYNC_OUTBOX") {
    event.waitUntil(syncOutbox());
    return;
  }

  if (message?.type === "RETRY_TRANSACTION") {
    event.waitUntil(
      (async () => {
        await clearOutboxFailure(message.requestId);
        await syncOutbox();
      })(),
    );
  }
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.method === "GET" && CACHEABLE_API_PATH.test(url.pathname)) {
    event.respondWith(networkFirstApi(request));
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/v1/auth/logout") {
    event.respondWith(clearPrivateCacheAfterLogout(request));
    return;
  }

  if (
    request.method === "POST" &&
    TRANSACTION_CREATE_PATH.test(url.pathname)
  ) {
    event.respondWith(
      (async () => {
        const response = await fetch(request);
        if (response.ok) {
          try {
            await clearCachedLedgerData();
          } catch (error) {
            console.warn("Could not clear cached ledger data:", error);
          }
        }
        return response;
      })(),
    );
  }
});
