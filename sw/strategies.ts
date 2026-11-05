import {
  APP_ROUTES,
  ASSET_CACHE,
  AUTH_URL,
  OFFLINE_URL,
  PAGE_CACHE,
  PRIVATE_CACHE,
} from "./config";
import {
  cacheAuthResponse,
  clearCachedLedgerData,
  getCachedUserId,
} from "./auth-cache";
import { putOutbox } from "./outbox";
import { requestBackgroundSync } from "./sync";

export function offlineResponse(
  message = "ইন্টারনেট সংযোগ নেই। আবার অনলাইনে চেষ্টা করুন।",
) {
  return new Response(
    JSON.stringify({ success: false, error: { message } }),
    { status: 503, headers: { "Content-Type": "application/json" } },
  );
}

export async function networkFirstPage(request: Request) {
  try {
    const response = await fetch(request);
    if (
      response.ok &&
      !response.redirected &&
      APP_ROUTES.includes(new URL(request.url).pathname)
    ) {
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

export async function networkFirstApi(request: Request) {
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

export async function cacheFirst(request: Request) {
  const cache = await caches.open(ASSET_CACHE);
  const saved = await cache.match(request);
  if (saved) return saved;

  const response = await fetch(request);
  if (response.ok) await cache.put(request, response.clone());
  return response;
}

export async function clearPrivateCacheAfterLogout(request: Request) {
  const response = await fetch(request);
  if (response.ok) await caches.delete(PRIVATE_CACHE);
  return response;
}

export async function queueTransactionWhenOffline(request: Request) {
  const headers = new Headers(request.headers);
  const requestId = headers.get("Idempotency-Key") || crypto.randomUUID();
  headers.set("Idempotency-Key", requestId);

  let input: Record<string, any> | null;
  try {
    input = await request.clone().json();
  } catch {
    input = null;
  }

  const keyedRequest = new Request(request, { headers });

  try {
    const response = await fetch(keyedRequest);
    if (response.ok) {
      try {
        await clearCachedLedgerData();
      } catch (error) {
        console.warn("Could not clear cached ledger data:", error);
      }
    }
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
      await putOutbox({ requestId, userId, input, transaction, createdAt });
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