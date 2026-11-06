import { apiRequest } from "@/lib/api/client";

// Public key only. The private key stays on the backend, never in the frontend.
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

export type PushStatus = "unsupported" | "blocked" | "off" | "on";

export function isPushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window &&
    Boolean(VAPID_PUBLIC_KEY)
  );
}

// The browser wants the key as bytes, but we store it as text.
function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

async function getReadyServiceWorker(): Promise<ServiceWorkerRegistration> {
  let timeoutId: number | undefined;
  try {
    return await Promise.race([
      navigator.serviceWorker.ready,
      new Promise<never>((_, reject) => {
        timeoutId = window.setTimeout(
          () =>
            reject(
              new Error(
                "নোটিফিকেশন সার্ভিস চালু হতে দেরি হচ্ছে। পৃষ্ঠাটি রিফ্রেশ করে আবার চেষ্টা করুন।",
              ),
            ),
          10000,
        );
      }),
    ]);
  } finally {
    if (timeoutId !== undefined) window.clearTimeout(timeoutId);
  }
}

export async function getPushStatus(): Promise<PushStatus> {
  if (!isPushSupported()) return "unsupported";
  if (Notification.permission === "denied") return "blocked";

  const registration = await navigator.serviceWorker.getRegistration("/");
  const subscription = await registration?.pushManager.getSubscription();
  return subscription && Notification.permission === "granted" ? "on" : "off";
}

// Call this ONLY from a button click. Browsers ignore permission prompts
// that appear without a tap, and iPhones require a tap.
export async function enablePush(): Promise<void> {
  if (!isPushSupported()) {
    throw new Error("এই ডিভাইসে নোটিফিকেশন সমর্থিত নয়।");
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("নোটিফিকেশনের অনুমতি দেওয়া হয়নি।");
  }

  const registration = await getReadyServiceWorker();
  const subscription =
    (await registration.pushManager.getSubscription()) ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    }));

  // Tell the backend: "send this owner's reminders to this device".
  await apiRequest("/push/subscribe", {
    method: "POST",
    body: JSON.stringify(subscription.toJSON()),
  });
}

export async function disablePush(): Promise<void> {
  if (!isPushSupported()) return;

  const registration = await navigator.serviceWorker.getRegistration("/");
  const subscription = await registration?.pushManager.getSubscription();
  if (!subscription) return;

  try {
    await apiRequest("/push/unsubscribe", {
      method: "POST",
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    });
  } finally {
    await subscription.unsubscribe();
  }
}