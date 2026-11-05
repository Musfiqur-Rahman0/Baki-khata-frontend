const CACHE_VERSION = "baki-khata-v1";
const ASSET_CACHE = `${CACHE_VERSION}-assets`;
const PAGE_CACHE = `${CACHE_VERSION}-pages`;
const PRIVATE_CACHE = `${CACHE_VERSION}-private`;
const DATABASE_NAME = "baki-khata-offline";
const OUTBOX_STORE = "transactions";
const OFFLINE_URL = "/offline.html";
const APP_ROUTES = ["/", "/store", "/auth", "/demo-store", "/onbording"];
const CORE_ASSETS = [
  OFFLINE_URL,
  "/manifest.webmanifest",
  "/apple-touch-icon.png",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-512.png",
  "/pwa-icon.svg",
];
const AUTH_URL = new URL("/api/v1/auth/me", self.location.origin).href;
const CACHEABLE_API_PATH =
  /^\/api\/v1\/(auth\/me|customers(?:\/.*)?|transactions(?:\/.*)?)$/;
const TRANSACTION_CREATE_PATH = /^\/api\/v1\/transactions\/?$/;

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
            if (response.ok) await pages.put(path, response);
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
      const names = await caches.keys();
      await Promise.all(
        names
          .filter(
            (name) =>
              name.startsWith("baki-khata-") &&
              ![ASSET_CACHE, PAGE_CACHE, PRIVATE_CACHE].includes(name),
          )
          .map((name) => caches.delete(name)),
        // filter returns an array of cache names that start with "baki-khatao-"
        // and are not in the list of current cache names (ASSET_CACHE, PAGE_CACHE,
        // PRIVATE_CACHE). Then map is used to create an array of promises that
        // delete each of those caches. finally, Promise.all is used to wait for all of those promises to resolve before continuing
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

self.addEventListener("sync", (event) => {
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

async function networkFirstPage(request) {
  try {
    const response = await fetch(request);
    if (response.ok && APP_ROUTES.includes(new URL(request.url).pathname)) {
      const cache = await caches.open(PAGE_CACHE);
      await cache.put(new URL(request.url).pathname, response.clone());
    }
    return response;
  } catch {
    const cache = await caches.open(PAGE_CACHE);
    const path = new URL(request.url).pathname;
    return (
      (await cache.match(path)) ||
      (await caches.match(OFFLINE_URL)) ||
      offlineResponse()
    );
  }
}

async function networkFirstApi(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      if (new URL(request.url).href === AUTH_URL) {
        await cacheAuthResponse(response.clone());
      } else if (await getCachedUserId()) {
        const cache = await caches.open(PRIVATE_CACHE);
        await cache.put(request, response.clone());
      }
    }
    return response;
  } catch {
    const cache = await caches.open(PRIVATE_CACHE);
    return (await cache.match(request)) || offlineResponse();
  }
}

async function cacheAuthResponse(response) {
  const payload = await response.clone().json();
  const userId = payload?.data?.user?.id;
  if (typeof userId !== "string") return;

  const existingUserId = await getCachedUserId();
  if (existingUserId && existingUserId !== userId) {
    await caches.delete(PRIVATE_CACHE);
  }
  const cache = await caches.open(PRIVATE_CACHE);
  await cache.put(AUTH_URL, response);
}

async function getCachedUserId() {
  const cache = await caches.open(PRIVATE_CACHE);
  const response = await cache.match(AUTH_URL);
  if (!response) return null;
  const payload = await response.json();
  const userId = payload?.data?.user?.id;
  return typeof userId === "string" ? userId : null;
}

async function cacheFirst(request) {
  const cache = await caches.open(ASSET_CACHE);
  const saved = await cache.match(request);
  if (saved) return saved;

  const response = await fetch(request);
  if (response.ok) await cache.put(request, response.clone());
  return response;
}

async function queueTransactionWhenOffline(request) {
  const headers = new Headers(request.headers);
  const requestId = headers.get("Idempotency-Key") || crypto.randomUUID();
  headers.set("Idempotency-Key", requestId);

  let input;
  try {
    input = await request.clone().json();
  } catch {
    input = null;
  }

  const keyedRequest = new Request(request, { headers });

  try {
    const response = await fetch(keyedRequest);
    if (response.ok) await clearCachedLedgerData();
    return response;
  } catch {
    const userId = await getCachedUserId();
    if (!userId) {
      return offlineResponse(
        "অফলাইনে লেনদেন সংরক্ষণ করতে আগে অনলাইনে সাইন ইন করুন।",
      );
    }
    if (
      typeof input?.customerId !== "string" ||
      !["CREDIT", "PAYMENT"].includes(input.type) ||
      !Number.isFinite(Number(input.amount)) ||
      Number(input.amount) <= 0
    ) {
      return offlineResponse(
        "লেনদেনের তথ্য পড়া যায়নি। অনলাইনে ফিরে আবার চেষ্টা করুন।",
      );
    }

    const createdAt = new Date().toISOString();
    const transaction = {
      id: `pending-${requestId}`,
      customerId: input.customerId,
      type: input.type,
      amount: String(input.amount),
      note: input.note ?? null,
      date: input.date ?? createdAt,
      createdAt,
      pendingSync: true,
    };
    try {
      await putOutbox({
        requestId,
        userId,
        input,
        transaction,
        createdAt,
      });
    } catch (error) {
      console.error("Could not save the offline transaction:", error);
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            message: "লেনদেনটি ডিভাইসে সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।",
          },
        }),
        { status: 507, headers: { "Content-Type": "application/json" } },
      );
    }
    await requestBackgroundSync();

    return new Response(
      JSON.stringify({
        success: true,
        data: transaction,
        meta: { queued: true, requestId },
      }),
      { status: 202, headers: { "Content-Type": "application/json" } },
    );
  }
}

async function clearPrivateCacheAfterLogout(request) {
  const response = await fetch(request);
  if (response.ok) await caches.delete(PRIVATE_CACHE);
  return response;
}

async function syncOutbox() {
  const records = await getOutbox();
  if (!records.length) return;

  let response;
  try {
    response = await fetch(AUTH_URL, {
      credentials: "include",
      cache: "no-store",
    });
  } catch {
    return;
  }
  if (!response.ok) return;

  const payload = await response.json();
  const currentUserId = payload?.data?.user?.id;
  if (typeof currentUserId !== "string") return;

  let synced = 0;
  for (const record of records) {
    if (record.userId !== currentUserId || record.failed) continue;

    let mutation;
    try {
      mutation = await fetch("/api/v1/transactions", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": record.requestId,
        },
        body: JSON.stringify(record.input),
      });
    } catch {
      return;
    }

    if (mutation.ok) {
      await deleteOutboxRecord(record.requestId);
      await clearCachedLedgerData();
      synced += 1;
      continue;
    }

    if (
      mutation.status >= 400 &&
      mutation.status < 500 &&
      mutation.status !== 401 &&
      mutation.status !== 408 &&
      mutation.status !== 429
    ) {
      const body = await mutation.json().catch(() => null);
      const message =
        body?.error?.message || "লেনদেনটি সার্ভারে সংরক্ষণ করা যায়নি।";
      await markOutboxFailed(record.requestId, message);
      await notifyClients({
        type: "OUTBOX_FAILED",
        requestId: record.requestId,
        message,
      });
      continue;
    }

    return;
  }
  if (synced) await notifyClients({ type: "OUTBOX_SYNCED", count: synced });
}

async function clearCachedLedgerData() {
  const cache = await caches.open(PRIVATE_CACHE);
  const requests = await cache.keys();
  await Promise.all(
    requests
      .filter(
        (request) =>
          CACHEABLE_API_PATH.test(new URL(request.url).pathname) &&
          new URL(request.url).href !== AUTH_URL,
      )
      .map((request) => cache.delete(request)),
  );
}

async function requestBackgroundSync() {
  if (!self.registration.sync) return;
  try {
    await self.registration.sync.register("sync-transactions");
  } catch (error) {
    console.warn("Background transaction sync could not be registered:", error);
  }
}

async function notifyClients(message) {
  const clients = await self.clients.matchAll({
    type: "window",
    includeUncontrolled: true,
  });
  for (const client of clients) client.postMessage(message);
}

function openOutbox() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, 1);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(OUTBOX_STORE)) {
        database.createObjectStore(OUTBOX_STORE, { keyPath: "requestId" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function runOutboxRequest(mode, operation) {
  const database = await openOutbox();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(OUTBOX_STORE, mode);
    const request = operation(transaction.objectStore(OUTBOX_STORE));
    let result;
    request.onsuccess = () => {
      result = request.result;
    };
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => {
      database.close();
      resolve(result);
    };
    transaction.onerror = () => {
      database.close();
      reject(transaction.error);
    };
    transaction.onabort = () => {
      database.close();
      reject(transaction.error);
    };
  });
}

function getOutbox() {
  return runOutboxRequest("readonly", (store) => store.getAll());
}

function putOutbox(record) {
  return runOutboxRequest("readwrite", (store) => store.put(record));
}

function deleteOutboxRecord(requestId) {
  return runOutboxRequest("readwrite", (store) => store.delete(requestId));
}

async function markOutboxFailed(requestId, message) {
  const records = await getOutbox();
  const record = records.find((item) => item.requestId === requestId);
  if (record) await putOutbox({ ...record, failed: message });
}

async function clearOutboxFailure(requestId) {
  const records = await getOutbox();
  const record = records.find((item) => item.requestId === requestId);
  if (!record) return;
  const retryable = { ...record };
  delete retryable.failed;
  await putOutbox(retryable);
}

function offlineResponse(
  message = "ইন্টারনেট সংযোগ নেই। আবার অনলাইনে চেষ্টা করুন।",
) {
  return new Response(
    JSON.stringify({
      success: false,
      error: { message },
    }),
    {
      status: 503,
      headers: { "Content-Type": "application/json" },
    },
  );
}
