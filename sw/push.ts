declare const self: ServiceWorkerGlobalScope;

// Shape of the JSON your backend sends with each push.
type PushPayload = {
  title?: string;
  body?: string;
  customerId?: string;
  url?: string; // e.g. "/store?remind=<customerId>"
};

const DEFAULT_PATH = "/store";

// Only ever open pages on our own site, even if a push payload is wrong.
function safeUrl(path: unknown): string {
  const fallback = new URL(DEFAULT_PATH, self.location.origin).href;
  if (typeof path !== "string") return fallback;
  try {
    const url = new URL(path, self.location.origin);
    return url.origin === self.location.origin ? url.href : fallback;
  } catch {
    return fallback;
  }
}

// 1. The backend sent a push: show a notification.
// Chrome requires a visible notification for every push, so always show one.
self.addEventListener("push", (event) => {
  let payload: PushPayload = {};
  try {
    payload = event.data ? (event.data.json() as PushPayload) : {};
  } catch {
    payload = { body: event.data?.text() };
  }

  event.waitUntil(
    self.registration.showNotification(payload.title ?? "বাকি খাতা", {
      body: payload.body ?? "একজন কাস্টমারের বাকি অনেক দিন ধরে পরিশোধ হয়নি।",
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      // Same tag = a newer reminder for the same customer replaces the old one.
      tag: payload.customerId ? `remind-${payload.customerId}` : "remind",
      data: { url: payload.url },
    }),
  );
});

// 2. The owner tapped the notification: open (or reuse) the app at that customer.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = safeUrl(event.notification.data?.url);

  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      const existing = windows.find(
        (client) => new URL(client.url).origin === self.location.origin,
      );

      if (existing) {
        try {
          await existing.focus();
          await existing.navigate(target);
          return;
        } catch {
          // Could not reuse the window; open a new one below.
        }
      }
      await self.clients.openWindow(target);
    })(),
  );
});

export {};
