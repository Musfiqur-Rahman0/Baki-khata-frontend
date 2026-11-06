export type QueuedTransaction = {
  id: string;
  customerId: string;
  type: "CREDIT" | "PAYMENT";
  amount: string;
  note: string | null;
  date: string;
  createdAt: string;
  pendingSync: true;
  syncError?: string;
};

export type CachedAuthUser = {
  id: string;
  name: string;
  shopName: string;
  businessType: string;
  phone: string | null;
};

function getServiceWorkerTarget(): ServiceWorker | null {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }
  return navigator.serviceWorker.controller;
}

export async function getQueuedTransactions(): Promise<QueuedTransaction[]> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    return [];
  }

  const existingRegistration = await navigator.serviceWorker.getRegistration("/");
  if (!existingRegistration) return [];
  const registration = await navigator.serviceWorker.ready;
  const worker = getServiceWorkerTarget() ?? registration.active;
  if (!worker) return [];

  return new Promise((resolve, reject) => {
    const channel = new MessageChannel();
    const timeout = window.setTimeout(() => {
      channel.port1.close();
      reject(new Error("অফলাইন লেনদেনের তালিকা পড়া যায়নি।"));
    }, 3000);
    channel.port1.onmessage = (event: MessageEvent<unknown>) => {
      window.clearTimeout(timeout);
      channel.port1.close();
      if (Array.isArray(event.data)) {
        resolve(event.data as QueuedTransaction[]);
        return;
      }
      const message =
        typeof event.data === "object" &&
        event.data !== null &&
        "error" in event.data &&
        typeof event.data.error === "string"
          ? event.data.error
          : "অফলাইন লেনদেনের তালিকা পড়া যায়নি।";
      reject(new Error(message));
    };
    worker.postMessage({ type: "GET_PENDING_TRANSACTIONS" }, [channel.port2]);
  });
}

export async function cacheAuthenticatedUser(user: CachedAuthUser): Promise<void> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration("/");
    if (!registration) return;
    const worker =
      getServiceWorkerTarget() ??
      registration.active ??
      (await navigator.serviceWorker.ready).active;
    worker?.postMessage({ type: "CACHE_AUTH_USER", user });
  } catch (error) {
    console.error("Could not save the offline account session:", error);
  }
}

export function retryQueuedTransaction(transactionId: string): void {
  const requestId = transactionId.replace(/^pending-/, "");
  getServiceWorkerTarget()?.postMessage({
    type: "RETRY_TRANSACTION",
    requestId,
  });
}
