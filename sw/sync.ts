import { AUTH_URL } from "./config";
import { clearCachedLedgerData } from "./auth-cache";
import { deleteOutboxRecord, getOutbox, markOutboxFailed } from "./outbox";

declare const self: ServiceWorkerGlobalScope;

export async function notifyClients(message: unknown) {
  const clients = await self.clients.matchAll({
    type: "window",
    includeUncontrolled: true,
  });
  for (const client of clients) client.postMessage(message);
}

export async function requestBackgroundSync() {
  // Background Sync isn't in the default WebWorker typings
  const sync = (self.registration as any).sync;
  if (!sync) return;
  try {
    await sync.register("sync-transactions");
  } catch (error) {
    console.warn("Background transaction sync could not be registered:", error);
  }
}

export async function syncOutbox() {
  const records = await getOutbox();
  if (!records.length) return;

  let response: Response;
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

    let mutation: Response;
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
